import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/accounts — list your connected Pinterest accounts
 * Auth: Authorization: Bearer zs_xxxxxxxx
 */
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("pinterest_accounts")
    .select("id, pinterest_username, business_name, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ accounts: data || [] });
}
