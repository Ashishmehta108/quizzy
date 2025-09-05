import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { NotionIntegration } from "../config/db/schema";
import crypto from "crypto";
import { encryptToken, decryptToken } from "./encryptionHelper";
async function saveNotionIntegration(userId: string, tokenData: any) {
  await db.insert(NotionIntegration).values({
    id: crypto.randomUUID(),
    userId,
    notionAccessTokenHash: encryptToken(tokenData.access_token),
    notionRefreshTokenHash: tokenData.refresh_token
      ? encryptToken(tokenData.refresh_token)
      : null,
    notionWorkspaceId: tokenData.workspace.id,
    notionWorkspaceName: tokenData.workspace.name,
    notionWorkspaceIcon: tokenData.workspace.icon,
    notionBotId: tokenData.bot_id,
    notionOwner: tokenData.owner?.type === "user",
  });
}

async function getNotionAccessToken(userId: string) {
  const [integration] = await db
    .select()
    .from(NotionIntegration)
    .where(eq(NotionIntegration.userId, userId));

  if (!integration) throw new Error("No Notion integration found for user");

  return decryptToken(integration.notionAccessTokenHash!);
}
