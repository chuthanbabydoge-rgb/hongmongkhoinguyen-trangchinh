// ─────────────────────────────────────────────────────────────────────────────
// Centralized API client
//
// All requests flow through here.
// To add auth later: attach a Bearer token in the headers block below.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "/api";

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
 * Unwraps the `{ ok, data }` envelope and throws `ApiError` on failure.
 *
 * When auth is added:
 *   headers: { Authorization: `Bearer ${getToken()}`, ... }
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
  } catch (networkErr) {
    throw new ApiError(
      "Không thể kết nối máy chủ. Vui lòng thử lại.",
      0,
      path,
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new ApiError(
      body?.error ?? `Lỗi HTTP ${res.status}`,
      res.status,
      path,
    );
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;

  if (!envelope.ok) {
    throw new ApiError(envelope.error ?? "Lỗi từ máy chủ.", 200, path);
  }

  return envelope.data;
}
