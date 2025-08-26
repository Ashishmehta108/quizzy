import { Request, Response } from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import { TokenResponse } from "../types/notion";

const { NOTION_CLIENT_ID, NOTION_CLIENT_SECRET, NOTION_REDIRECT_URI } =
  process.env;

const userTokens = new Map<string, TokenResponse>();

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

    if (!code || !state || state !== stateCookie) {
      return res.status(400).send("Invalid state or missing code.");
    }

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

    const tokenData = (await tokenRes.json()) as TokenResponse;
    const sessionId = crypto.randomBytes(8).toString("hex");
    userTokens.set(sessionId, tokenData);

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

export const getDatabases = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies["demo_session_id"];
    const tokenData = userTokens.get(sessionId);
    if (!tokenData?.access_token) {
      return res.status(401).json({ error: "Not connected to Notion" });
    }

    const notionRes = await fetch("https://api.notion.com/v1/databases", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
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

export const getIntegrationInfo = (req: Request, res: Response) => {
  const sessionId = req.cookies["demo_session_id"];
  const tokenData = userTokens.get(sessionId);

  if (!tokenData) {
    return res.status(401).json({ error: "Not connected to Notion" });
  }

  res.json({
    workspace_id: tokenData.workspace_id,
    bot_id: tokenData.bot_id,
    owner: tokenData.owner,
  });
};
