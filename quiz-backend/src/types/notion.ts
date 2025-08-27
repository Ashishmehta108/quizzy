export interface TokenResponse {
  access_token: string;
  workspace_id: string;
  bot_id: string;
  owner: object;
  duplicated_template_id?: string;
}
