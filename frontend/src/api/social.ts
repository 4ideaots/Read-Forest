import { apiRequest } from './http';

export interface VillageForest {
  userId: number;
  nickname: string;
  title: string | null;
  cheerCount: number;
  state: string; // serialized garden JSON
}

export interface GuestbookEntry {
  id: number;
  writerId: number;
  content: string;
  createdAt: string;
}

// GET /api/village — other users' forests (with their serialized garden state).
export function getVillage(): Promise<VillageForest[]> {
  return apiRequest<VillageForest[]>('/village');
}

// POST /api/village/{ownerUserId}/cheer — send a cheer (water) to a forest.
export function cheerForest(ownerUserId: number): Promise<{ ownerUserId: number; cheerCount: number }> {
  return apiRequest(`/village/${ownerUserId}/cheer`, { method: 'POST' });
}

// GET /api/forests/{ownerUserId}/guestbook — read a forest's guestbook.
export function getGuestbook(ownerUserId: number): Promise<GuestbookEntry[]> {
  return apiRequest<GuestbookEntry[]>(`/forests/${ownerUserId}/guestbook`);
}

// POST /api/forests/{ownerUserId}/guestbook — leave a guestbook message.
export function writeGuestbook(ownerUserId: number, content: string): Promise<void> {
  return apiRequest<void>(`/forests/${ownerUserId}/guestbook`, { method: 'POST', body: { content } });
}
