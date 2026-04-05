import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPinterestAuthUrl } from "@/lib/pinterest";
import { randomBytes } from "crypto";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_SITE_URL!));
  }

  // Store state in a cookie to verify callback
  const state = randomBytes(16).toString("hex");
  const authUrl = getPinterestAuthUrl(state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("pinterest_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 min
  });

  return response;
}
