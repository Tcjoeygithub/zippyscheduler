import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/pinterest-account";
import { createBoard, listBoards } from "@/lib/pinterest";

// GET /api/boards?account_id=... — sync and return boards from Pinterest
export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const accountId = url.searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json({ error: "account_id required" }, { status: 400 });
  }

  // Verify user owns this account
  const { data: account } = await supabase
    .from("pinterest_accounts")
    .select("id")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const token = await getValidAccessToken(accountId);
    const result = await listBoards(token);
    const items = result.items || [];

    // Upsert into our DB
    for (const board of items) {
      await supabase.from("pinterest_boards").upsert(
        {
          account_id: accountId,
          pinterest_board_id: board.id,
          name: board.name,
          description: board.description || "",
          privacy: board.privacy || "PUBLIC",
          pin_count: board.pin_count || 0,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "account_id,pinterest_board_id" }
      );
    }

    const { data: boards } = await supabase
      .from("pinterest_boards")
      .select("*")
      .eq("account_id", accountId)
      .order("name");

    return NextResponse.json({ boards: boards || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/boards — create a new board on Pinterest
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { account_id, name, description, privacy } = body;

  if (!account_id || !name) {
    return NextResponse.json(
      { error: "account_id and name required" },
      { status: 400 }
    );
  }

  // Verify user owns this account
  const { data: account } = await supabase
    .from("pinterest_accounts")
    .select("id")
    .eq("id", account_id)
    .eq("user_id", user.id)
    .single();
  if (!account) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  try {
    const token = await getValidAccessToken(account_id);
    const board = await createBoard(token, { name, description, privacy });

    const { data: saved } = await supabase
      .from("pinterest_boards")
      .insert({
        account_id,
        pinterest_board_id: board.id,
        name: board.name,
        description: board.description || "",
        privacy: board.privacy || "PUBLIC",
        pin_count: 0,
      })
      .select()
      .single();

    return NextResponse.json({ board: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
