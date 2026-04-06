import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { account_id } = await request.json();

  // Delete pins, boards, then account (cascade would handle this but let's be explicit)
  await supabase.from("pins").delete().eq("account_id", account_id).eq("user_id", user.id);
  await supabase.from("pinterest_boards").delete().eq("account_id", account_id);
  await supabase.from("pinterest_accounts").delete().eq("id", account_id).eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
