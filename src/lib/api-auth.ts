import { createAdminClient } from "./supabase/server";
import { createHash, randomBytes } from "crypto";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = `zs_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 11); // "zs_" + first 8 chars
  return { key: raw, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/**
 * Verifies an API key from the Authorization header and returns the user_id.
 */
export async function authenticateApiKey(
  request: Request
): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.slice(7);
  if (!key.startsWith("zs_")) return null;

  const hash = hashApiKey(key);
  const admin = createAdminClient();

  const { data } = await admin
    .from("api_keys")
    .select("user_id, id")
    .eq("key_hash", hash)
    .single();

  if (!data) return null;

  // Update last_used_at (fire and forget)
  admin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then();

  return { userId: data.user_id };
}
