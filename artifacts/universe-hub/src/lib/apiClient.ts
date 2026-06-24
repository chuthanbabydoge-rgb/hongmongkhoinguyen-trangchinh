// ─────────────────────────────────────────────────────────────────────────────
// Centralized API client
//
// Reads the session token from localStorage and attaches it as a
// Bearer token on every request so the Hub backend can forward it
// to Universe Account API (HUB-4.1).
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE       = "/api";
const SESSION_KEY    = "universe_hub_session_v1";

interface StoredSession {
  accessToken: string;
  expiresAt: number;
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredSession;
    if (Date.now() > s.expiresAt) return null;
    return s.accessToken;
  } catch {
    return null;
  }
}

interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch a JSON resource from the backend API.
 * Attaches Authorization header when a session token is present.
 * Unwraps the { ok, data } envelope and throws ApiError on failure.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url   = `${API_BASE}${path}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError("Không thể kết nối máy chủ. Vui lòng thử lại.", 0, path);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(body?.error ?? `Lỗi HTTP ${res.status}`, res.status, path);
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;

  if (!envelope.ok) {
    throw new ApiError(envelope.error ?? "Lỗi từ máy chủ.", 200, path);
  }

  return envelope.data;
}
