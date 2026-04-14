import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/pins/[id] — edit a pin (only while scheduled or draft)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("pins")
    .select("id, user_id, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Pin not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Cannot edit a pin that has already been posted" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const allowed = [
    "title",
    "description",
    "link",
    "image_url",
    "alt_text",
    "scheduled_for",
    "board_id",
  ];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  // If board_id is being changed, verify the user owns that board.
  if (patch.board_id) {
    const { data: board } = await supabase
      .from("pinterest_boards")
      .select("id")
      .eq("id", patch.board_id)
      .single();
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
  }

  const { data: pin, error } = await supabase
    .from("pins")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ pin });
}

// DELETE /api/pins/[id] — remove a scheduled/draft/failed pin from the queue
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("pins")
    .select("id, status")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Pin not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Cannot delete a pin that has already been posted" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("pins")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
