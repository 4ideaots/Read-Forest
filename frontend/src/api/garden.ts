import { apiRequest } from './http';

export interface GardenStateResponse {
  state: string | null;
  updatedAt: string | null;
}

// GET /api/garden-state — the full serialized garden snapshot for the user.
export function getGardenState(): Promise<GardenStateResponse> {
  return apiRequest<GardenStateResponse>('/garden-state');
}

// PUT /api/garden-state — persist the full serialized garden snapshot.
export function saveGardenState(state: string): Promise<GardenStateResponse> {
  return apiRequest<GardenStateResponse>('/garden-state', { method: 'PUT', body: { state } });
}
