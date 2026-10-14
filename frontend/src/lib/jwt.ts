interface TokenPayload {
  userId: string;
  username: string;
  exp: number;
}

/**
 * Reads the (unverified) payload of the login JWT purely to learn our own
 * userId — the cookie stays httpOnly and remains the thing that authenticates
 * us. We never persist the token itself.
 */
export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const json = atob(segment.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as Partial<TokenPayload>;

    if (!payload.userId || !payload.username) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}
