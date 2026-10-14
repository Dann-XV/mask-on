const STORAGE_KEY = "maskon.identity";

export interface Identity {
  userId: string;
  username: string;
}

/**
 * Only our own id and username live here — never the token. The httpOnly cookie
 * is still the credential; this is just so the UI knows who "we" are after a
 * refresh, since the backend exposes no `GET /me`.
 */
export function saveIdentity(identity: Identity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // Private-mode or storage-disabled browsers: the session still works, it
    // just won't survive a reload.
  }
}

export function readIdentity(): Identity | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (!parsed.userId || !parsed.username) return null;

    return parsed as Identity;
  } catch {
    return null;
  }
}

export function clearIdentity() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if storage is unavailable.
  }
}
