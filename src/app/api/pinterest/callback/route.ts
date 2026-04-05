import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForToken, getUserAccount } from "@/lib/pinterest";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent(error)}`, siteUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard?error=missing_code", siteUrl)
    );
  }

  // Verify state matches what we set in the cookie
  const cookieStore = cookies();
  const savedState = cookieStore.get("pinterest_oauth_state")?.value;
  if (state !== savedState) {
    return NextResponse.redirect(
      new URL("/dashboard?error=invalid_state", siteUrl)
    );
  }

  // Get current user
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", siteUrl));
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get Pinterest user info
    const pinterestUser = await getUserAccount(tokens.access_token);

    // Save to database
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error: dbError } = await supabase.from("pinterest_accounts").upsert(
      {
        user_id: user.id,
        pinterest_user_id: pinterestUser.id,
        pinterest_username: pinterestUser.username,
        business_name: pinterestUser.business_name || null,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        scopes: tokens.scope,
      },
      { onConflict: "user_id,pinterest_user_id" }
    );

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard?error=db_error", siteUrl)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard?connected=1", siteUrl)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_failed", siteUrl)
    );
  }
}
