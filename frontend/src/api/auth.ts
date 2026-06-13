import { apiRequest } from './http';
import { setTokens, clearTokens } from './token';
import type { LoginResponse, SignupResponse } from './types';

// POST /api/auth/login — exchanges credentials for a token pair.
export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
  });
  setTokens(res.accessToken, res.refreshToken);
  return res;
}

// POST /api/accounts/signup — creates an account (does not log in).
export async function signup(
  username: string,
  password: string,
  nickname: string
): Promise<SignupResponse> {
  return apiRequest<SignupResponse>('/accounts/signup', {
    method: 'POST',
    body: { username, password, nickname },
    auth: false,
  });
}

export function logout(): void {
  clearTokens();
}
