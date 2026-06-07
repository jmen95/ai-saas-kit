const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes, matches API access token TTL

export type ApiError = { code: string; message: string; statusCode: number };

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export function getStoredTokens() {
  if (typeof window === "undefined") return null;
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

function syncAccessCookie(accessToken: string) {
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${ACCESS_TOKEN_MAX_AGE}; SameSite=Lax`;
}

/** Persist a fresh session (tokens in localStorage + access cookie for middleware). */
export function setSession(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  syncAccessCookie(accessToken);
}

/** @deprecated use setSession — kept for backwards compatibility. */
export function storeTokens(accessToken: string, refreshToken: string) {
  setSession(accessToken, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchange the refresh token for a new access token. De-duplicates concurrent
 * refreshes so a burst of 401s only triggers a single network call.
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const tokens = getStoredTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const json = await res.json();
      const data = json.data ?? json;
      if (!data.accessToken || !data.refreshToken) {
        clearTokens();
        return null;
      }
      setSession(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Revoke the refresh token server-side and clear the local session. */
export async function logout() {
  const tokens = getStoredTokens();
  if (tokens?.refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
    } catch {
      /* best effort — clear locally regardless */
    }
  }
  clearTokens();
}

async function rawFetch(
  path: string,
  options: RequestInit & { auth?: boolean },
  accessToken: string | null,
) {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<ApiResult<T>> {
  const tokens = options.auth === false ? null : getStoredTokens();

  let res = await rawFetch(path, options, tokens?.accessToken ?? null);

  // On expired access token, transparently refresh once and retry.
  if (res.status === 401 && options.auth !== false && tokens?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await rawFetch(path, options, newToken);
    }
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const body = json as { error?: ApiError } | null;
    return {
      ok: false,
      error: body?.error ?? {
        code: "UNKNOWN",
        message: "Request failed",
        statusCode: res.status,
      },
    };
  }

  const body = json as { data?: T } | T;
  return {
    ok: true,
    data: (body as { data?: T })?.data ?? (body as T),
  };
}

export { API_URL };
