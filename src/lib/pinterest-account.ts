import { createAdminClient } from "./supabase/server";
import { refreshAccessToken } from "./pinterest";

/**
 * Gets a valid access token for a Pinterest account, refreshing if expired.
 */
export async function getValidAccessToken(accountId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: account, error } = await admin
    .from("pinterest_accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error || !account) {
    throw new Error("Pinterest account not found");
  }

  const expiresAt = new Date(account.token_expires_at);
  const now = new Date();
  const fiveMinFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  // Refresh if expired or expires within 5 minutes
  if (expiresAt < fiveMinFromNow) {
    const refreshed = await refreshAccessToken(account.refresh_token);
    const newExpiresAt = new Date(
      Date.now() + refreshed.expires_in * 1000
    ).toISOString();

    await admin
      .from("pinterest_accounts")
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || account.refresh_token,
        token_expires_at: newExpiresAt,
      })
      .eq("id", accountId);

    return refreshed.access_token;
  }

  return account.access_token;
}
