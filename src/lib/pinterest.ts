const PINTEREST_CLIENT_ID = process.env.PINTEREST_CLIENT_ID!;
const PINTEREST_CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET!;
const PINTEREST_REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI!;

export const PINTEREST_SCOPES = [
  "boards:read",
  "boards:write",
  "pins:read",
  "pins:write",
  "user_accounts:read",
].join(",");

export function getPinterestAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: PINTEREST_CLIENT_ID,
    redirect_uri: PINTEREST_REDIRECT_URI,
    response_type: "code",
    scope: PINTEREST_SCOPES,
    state,
  });
  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}> {
  const basicAuth = Buffer.from(
    `${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: PINTEREST_REDIRECT_URI,
      continuous_refresh: "true",
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest token exchange failed: ${err}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}> {
  const basicAuth = Buffer.from(
    `${PINTEREST_CLIENT_ID}:${PINTEREST_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest token refresh failed: ${err}`);
  }

  return res.json();
}

export async function pinterestApi(
  accessToken: string,
  path: string,
  options: RequestInit = {}
) {
  const res = await fetch(`https://api.pinterest.com/v5${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest API error ${res.status}: ${err}`);
  }

  return res.json();
}

export async function getUserAccount(accessToken: string) {
  return pinterestApi(accessToken, "/user_account");
}

export async function listBoards(accessToken: string) {
  return pinterestApi(accessToken, "/boards");
}

export async function createBoard(
  accessToken: string,
  data: { name: string; description?: string; privacy?: "PUBLIC" | "SECRET" }
) {
  return pinterestApi(accessToken, "/boards", {
    method: "POST",
    body: JSON.stringify({
      name: data.name,
      description: data.description || "",
      privacy: data.privacy || "PUBLIC",
    }),
  });
}

export async function createPin(
  accessToken: string,
  data: {
    board_id: string;
    title: string;
    description?: string;
    link?: string;
    image_url: string;
    alt_text?: string;
  }
) {
  return pinterestApi(accessToken, "/pins", {
    method: "POST",
    body: JSON.stringify({
      board_id: data.board_id,
      title: data.title,
      description: data.description || "",
      link: data.link,
      alt_text: data.alt_text,
      media_source: {
        source_type: "image_url",
        url: data.image_url,
      },
    }),
  });
}
