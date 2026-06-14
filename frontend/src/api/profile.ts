import { apiRequest } from './http';

export interface Profile {
  userId: number;
  nickname: string;
  title: string | null;
  bio: string | null;
  profileImageUrl: string | null;
}

export interface ProfileUpdate {
  nickname?: string;
  title?: string;
  bio?: string;
}

// GET /api/profiles/{userId} — a user's public profile.
export function getProfile(userId: number): Promise<Profile> {
  return apiRequest<Profile>(`/profiles/${userId}`);
}

// PATCH /api/profiles/me — update the logged-in user's profile (partial).
export function updateProfile(body: ProfileUpdate): Promise<Profile> {
  return apiRequest<Profile>('/profiles/me', { method: 'PATCH', body });
}
