import { Request, Response } from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import { TokenResponse } from "../types/notion";
import { NotionIntegration } from "../config/db/schema";
import { db } from "../config/db/index";
import { eq } from "drizzle-orm";
import { encryptToken, decryptToken } from "../utils/encryptionHelper";
import { OauthTokenResponse } from "@notionhq/client";
const { NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, NOTION_REDIRECT_URI } =
  process.env;

function buildNotionAuthUrl(state: string) {
  const base = "https://api.notion.com/v1/oauth/authorize";
  const params = new URLSearchParams({
    client_id: NOTION_CLIENT_ID as string,
    response_type: "code",
    owner: "user",
    redirect_uri: NOTION_REDIRECT_URI as string,
    state,
  });
  return `${base}?${params.toString()}`;
}

export const notionLogin = (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  res.cookie("notion_oauth_state", state, {
    httpOnly: true,
    sameSite: "none",
    signed: true,
    secure: true,
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(buildNotionAuthUrl(state));
};

export const notionCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const stateCookie = req.signedCookies["notion_oauth_state"];
    if (!code || !state || state !== stateCookie)
      return res.status(400).send("Invalid state or missing code.");

    res.clearCookie("notion_oauth_state");

    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.status(500).send(`Token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as OauthTokenResponse;
    const sessionId = crypto.randomUUID();

    const accessTokenEncrypted = encryptToken(tokenData.access_token);
    const refreshTokenEncrypted = tokenData.refresh_token
      ? encryptToken(tokenData.refresh_token)
      : null;

    await db.insert(NotionIntegration).values({
      id: sessionId,
      userId: tokenData.owner?.type === "user" ? tokenData.owner.user.id : "",
      notionAccessTokenHash: accessTokenEncrypted,
      notionRefreshTokenHash: refreshTokenEncrypted,
      notionWorkspaceId: tokenData.workspace_id,
      notionWorkspaceName: tokenData.workspace_name,
      notionWorkspaceIcon: tokenData.workspace_icon,
      notionBotId: tokenData.bot_id,
      notionOwner: tokenData.owner?.type === "user",
    });

    res.cookie("notion_session_id", sessionId, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:3000/success");
  } catch (e) {
    console.error(e);
    res.status(500).send("OAuth callback error");
  }
};

async function refreshNotionToken(sessionId: string) {
  const integration = await db
    .select()
    .from(NotionIntegration)
    .where(eq(NotionIntegration.id, sessionId))
    .then((rows) => rows[0]);
  if (!integration?.notionRefreshTokenHash)
    throw new Error("No refresh token available");

  const refreshToken = decryptToken(integration.notionRefreshTokenHash);

  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " +
        Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error("Failed to refresh Notion token: " + errText);
  }

  const newTokenData = (await tokenRes.json()) as OauthTokenResponse;

  await db
    .update(NotionIntegration)
    .set({
      notionAccessTokenHash: encryptToken(newTokenData.access_token),
      notionRefreshTokenHash: newTokenData.refresh_token
        ? encryptToken(newTokenData.refresh_token)
        : integration.notionRefreshTokenHash,
      updatedAt: new Date(),
    })
    .where(eq(NotionIntegration.id, sessionId));

  return newTokenData.access_token;
}

async function getNotionTokenFromSession(sessionId: string) {
  const integration = await db
    .select()
    .from(NotionIntegration)
    .where(eq(NotionIntegration.id, sessionId))
    .then((rows) => rows[0]);
  if (!integration)
    throw new Error("Notion integration not found for this session");

  try {
    return decryptToken(integration.notionAccessTokenHash!);
  } catch {
    return await refreshNotionToken(sessionId);
  }
}

export const getDatabases = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies["notion_session_id"];
    if (!sessionId)
      return res.status(401).json({ error: "No session cookie found" });

    const accessToken = await getNotionTokenFromSession(sessionId);

    const notionRes = await fetch("https://api.notion.com/v1/databases", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Notion-Version": "2022-06-28",
      },
    });

    const data = await notionRes.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch databases" });
  }
};

export const getIntegrationInfo = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies["notion_session_id"];
    if (!sessionId)
      return res.status(401).json({ error: "No session cookie found" });

    const integration = await db
      .select()
      .from(NotionIntegration)
      .where(eq(NotionIntegration.id, sessionId))
      .then((rows) => rows[0]);
    if (!integration)
      return res.status(404).json({ error: "Integration not found" });

    res.json({
      workspace_id: integration.notionWorkspaceId,
      bot_id: integration.notionBotId,
      owner: integration.notionOwner,
      workspace_name: integration.notionWorkspaceName,
      workspace_icon: integration.notionWorkspaceIcon,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch integration info" });
  }
};
