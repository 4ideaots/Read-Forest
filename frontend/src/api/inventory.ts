import { apiRequest } from './http';

export interface InventoryItem {
  id: number;
  itemId: number;
  itemName: string; // matches the frontend DecorationType key (e.g. "lantern")
  itemType: string;
  imageUrl: string | null;
  description: string | null;
  acquiredAt: string;
}

// GET /api/inventory/items — the logged-in user's owned items.
export function getInventory(): Promise<InventoryItem[]> {
  return apiRequest<InventoryItem[]>('/inventory/items');
}
