import { apiRequest } from './http';

export interface MeResponse {
  id: number;
  username: string;
  nickname: string;
}

// GET /api/users/me — the authenticated user's basic identity.
export function getMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/users/me');
}
