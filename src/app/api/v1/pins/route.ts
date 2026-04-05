import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/pinterest-account";
import { createPin } from "@/lib/pinterest";

/**
 * POST /api/v1/pins
 * Create a pin via API key authentication.
 *
 * Auth: Authorization: Bearer zs_xxxxxxxx
 *
 * Body:
 *   account_id: UUID of your Pinterest account connection
 *   board_id: UUID of the board (from Zippy's pinterest_boards table)
 *   title: Pin title (max 100 chars)
 *   description: Pin description (max 500 chars, optional)
 *   link: URL the pin links to (optional)
 *   image_url: URL of the image to pin
 *   alt_text: Accessibility text (optional)
 *   scheduled_for: ISO date string for scheduling (optional, null = immediate)
 */
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  const body = await request.json();
  const {
    account_id,
    board_id,
    title,
    description,
    link,
    image_url,
    alt_text,
    scheduled_for,
  } = body;

  if (!account_id || !board_id || !title || !image_url) {
    return NextResponse.json(
      { error: "account_id, board_id, title, and image_url required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Verify user owns the board
  const { data: board } = await admin
    .from("pinterest_boards")
    .select("id, pinterest_board_id, account_id")
    .eq("id", board_id)
    .eq("account_id", account_id)
    .single();
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const { data: accountCheck } = await admin
    .from("pinterest_accounts")
    .select("id")
    .eq("id", account_id)
    .eq("user_id", auth.userId)
    .single();
  if (!accountCheck) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (scheduled_for) {
    const { data: pin, error } = await admin
      .from("pins")
      .insert({
        user_id: auth.userId,
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

    const { data: pin } = await admin
      .from("pins")
      .insert({
        user_id: auth.userId,
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
    await admin.from("pins").insert({
      user_id: auth.userId,
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
