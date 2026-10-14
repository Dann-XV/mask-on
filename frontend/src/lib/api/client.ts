import { ApiError } from "@/types/api";

/**
 * Relative base: next.config.ts rewrites /api/v1/* to the Express server, which
 * keeps the httpOnly auth cookie same-origin and the backend free of CORS config.
 */
const API_BASE = "/api/v1";

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is the backend running?");
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error || "Something went wrong. Please try again.");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function get<T>(path: string) {
  return request<T>(path, { method: "GET" });
}
