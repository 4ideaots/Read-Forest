import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token';
import { ApiError } from './types';
import type { LoginResponse } from './types';

// Same-origin base path; Vite proxies `/api` to the Spring Boot backend in dev.
const BASE = '/api';

// Called when the session can no longer be refreshed (e.g. refresh expired).
// The auth context registers a handler so it can drop its UI state.
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(fn: (() => void) | null): void {
  onSessionExpired = fn;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach the Authorization header (default true)
  retryOnAuthFail?: boolean; // internal: prevents infinite refresh loops
}

// Single-flight refresh so concurrent 401s don't fire multiple refreshes.
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as LoginResponse;
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retryOnAuthFail = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Try a one-time token refresh on 401, then replay the request.
  if (res.status === 401 && auth && retryOnAuthFail) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnAuthFail: false });
    }
    clearTokens();
    onSessionExpired?.();
    throw new ApiError(401, '세션이 만료되었습니다. 다시 로그인해 주세요.');
  }

  if (!res.ok) {
    let message = `요청이 실패했습니다 (${res.status})`;
    try {
      const data = await res.json();
      if (data && typeof data.message === 'string') message = data.message;
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
