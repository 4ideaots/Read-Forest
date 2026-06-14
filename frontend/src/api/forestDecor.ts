import { apiRequest } from './http';

export interface DecorPlacement {
  itemId: number;
  positionX: number;
  positionY: number;
  isPlaced: boolean;
}

// PUT /api/forests/me/decorations — overwrite the user's placed decorations
// with the relational (Item-based) representation.
export function updateDecorations(decorations: DecorPlacement[]): Promise<unknown> {
  return apiRequest('/forests/me/decorations', { method: 'PUT', body: { decorations } });
}
