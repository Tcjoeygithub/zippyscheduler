import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * PATCH /api/v1/pins/:id — edit fields on a scheduled/draft pin
 * DELETE /api/v1/pins/:id — remove a scheduled/draft/failed pin
 * Auth: Authorization: Bearer zs_xxxxxxxx
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("pins")
    .select("id, status")
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Pin not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Cannot edit a posted pin" },
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
  for (const k of allowed) if (k in body) patch[k] = body[k];
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No editable fields" }, { status: 400 });
  }
  const { data: pin, error } = await admin
    .from("pins")
    .update(patch)
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ pin });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("pins")
    .select("id, status")
    .eq("id", params.id)
    .eq("user_id", auth.userId)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Pin not found" }, { status: 404 });
  }
  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Cannot delete a posted pin" },
      { status: 400 }
    );
  }
  const { error } = await admin
    .from("pins")
    .delete()
    .eq("id", params.id)
    .eq("user_id", auth.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
