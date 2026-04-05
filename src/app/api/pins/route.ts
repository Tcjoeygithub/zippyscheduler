import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/pinterest-account";
import { createPin } from "@/lib/pinterest";

// POST /api/pins — create a pin (publish immediately or schedule)
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    account_id,
    board_id, // internal UUID from pinterest_boards table
    title,
    description,
    link,
    image_url,
    alt_text,
    scheduled_for, // ISO string or null for immediate
  } = body;

  if (!account_id || !board_id || !title || !image_url) {
    return NextResponse.json(
      { error: "account_id, board_id, title, and image_url required" },
      { status: 400 }
    );
  }

  // Verify user owns the account and board
  const { data: board } = await supabase
    .from("pinterest_boards")
    .select("id, pinterest_board_id, account_id")
    .eq("id", board_id)
    .eq("account_id", account_id)
    .single();
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  // Verify user owns the account this board belongs to
  const { data: accountCheck } = await supabase
    .from("pinterest_accounts")
    .select("id")
    .eq("id", account_id)
    .eq("user_id", user.id)
    .single();
  if (!accountCheck) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (scheduled_for) {
    // Save as scheduled pin (cron will publish later)
    const { data: pin, error } = await supabase
      .from("pins")
      .insert({
        user_id: user.id,
        account_id,
        board_id,
        title,
        description,
        link,
        image_url,
        alt_text,
        status: "scheduled",
        scheduled_for,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ pin });
  }

  // Publish immediately
  try {
    const token = await getValidAccessToken(account_id);
    const pinterestPin = await createPin(token, {
      board_id: board.pinterest_board_id,
      title,
      description,
      link,
      image_url,
      alt_text,
    });

    const { data: pin } = await supabase
      .from("pins")
      .insert({
        user_id: user.id,
        account_id,
        board_id,
        title,
        description,
        link,
        image_url,
        alt_text,
        status: "posted",
        posted_at: new Date().toISOString(),
        pinterest_pin_id: pinterestPin.id,
      })
      .select()
      .single();

    return NextResponse.json({ pin });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Save as failed
    await supabase.from("pins").insert({
      user_id: user.id,
      account_id,
      board_id,
      title,
      description,
      link,
      image_url,
      alt_text,
      status: "failed",
      error_message: message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
