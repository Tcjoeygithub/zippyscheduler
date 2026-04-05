import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getValidAccessToken } from "@/lib/pinterest-account";
import { createPin } from "@/lib/pinterest";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find scheduled pins that are due
  const { data: duePins } = await admin
    .from("pins")
    .select("*, pinterest_boards!inner(pinterest_board_id)")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .limit(20);

  if (!duePins || duePins.length === 0) {
    return NextResponse.json({ published: 0, message: "No due pins" });
  }

  let succeeded = 0;
  let failed = 0;

  for (const pin of duePins) {
    try {
      const token = await getValidAccessToken(pin.account_id);
      const pinterestPin = await createPin(token, {
        board_id: pin.pinterest_boards.pinterest_board_id,
        title: pin.title,
        description: pin.description || "",
        link: pin.link,
        image_url: pin.image_url,
        alt_text: pin.alt_text,
      });

      await admin
        .from("pins")
        .update({
          status: "posted",
          posted_at: new Date().toISOString(),
          pinterest_pin_id: pinterestPin.id,
        })
        .eq("id", pin.id);

      succeeded++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await admin
        .from("pins")
        .update({ status: "failed", error_message: message })
        .eq("id", pin.id);
      failed++;
    }
  }

  return NextResponse.json({ published: succeeded, failed, total: duePins.length });
}
