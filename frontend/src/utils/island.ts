// Island geometry shared by the renderer and the shop.
// The island's tile radius grows as the garden fills up with trees & decorations.
export function islandTileRadius(objectCount: number): number {
  const radius = Math.max(180, 180 + Math.floor((objectCount - 4) / 3) * 30);
  return Math.floor(radius / 18);
}

// The farm cottage unlocks once the land has expanded past its starting size.
export const HOUSE_UNLOCK_RADIUS = 11;

export function isHouseUnlocked(objectCount: number): boolean {
  return islandTileRadius(objectCount) >= HOUSE_UNLOCK_RADIUS;
}
