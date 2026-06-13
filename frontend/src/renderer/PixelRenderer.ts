import type { Tree, Decoration, BiomeType, TreeType, DecorationType } from '../types';
import { getBiomeAt } from '../utils/biome';
import { islandTileRadius } from '../utils/island';

// ------------------------------------------------------------------
// 2D Top-down Pixel Art Renderer (Stardew Valley style)
// Replaces the previous WebGPU 3D voxel renderer with a Canvas2D
// tile/sprite renderer. All sprites are procedurally generated at
// 16px logical resolution and blitted with nearest-neighbor scaling.
//
// The island is drawn as a raised plateau: land tiles sit a few px
// above the water and a dirt cliff is painted along the water-facing
// edges, giving a 3/4 ("oblique top-down") feel rather than a flat
// straight-down map.
// ------------------------------------------------------------------

const TILE = 16; // logical pixels per tile

type RGB = [number, number, number];

// Deterministic pseudo-random hash (stable scenery between frames)
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function mix(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}

function css(c: RGB, f = 1): string {
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * 255 * f)));
  return `rgb(${ch(c[0])},${ch(c[1])},${ch(c[2])})`;
}

// --- Palette tables (carried over from the 3D renderer's biome colors) ---

const FOLIAGE: Record<BiomeType, Record<TreeType, RGB>> = {
  spring: { sakura: [1.0, 0.68, 0.78], pine: [0.12, 0.38, 0.22], maple: [0.62, 0.8, 0.25], birch: [0.45, 0.82, 0.4], oak: [0.22, 0.68, 0.28] },
  autumn: { sakura: [0.92, 0.48, 0.4], pine: [0.28, 0.36, 0.18], maple: [0.88, 0.22, 0.08], birch: [0.88, 0.78, 0.15], oak: [0.82, 0.58, 0.1] },
  winter: { sakura: [0.95, 0.95, 0.98], pine: [0.2, 0.4, 0.35], maple: [0.55, 0.4, 0.55], birch: [0.85, 0.88, 0.9], oak: [0.6, 0.6, 0.65] },
  desert: { sakura: [0.92, 0.2, 0.5], pine: [0.18, 0.65, 0.22], maple: [0.75, 0.35, 0.18], birch: [0.78, 0.72, 0.38], oak: [0.45, 0.52, 0.38] }
};

const GRASS: Record<BiomeType, { dark: RGB; light: RGB; tuft: RGB; flowers: RGB[] }> = {
  spring: { dark: [0.36, 0.68, 0.22], light: [0.46, 0.78, 0.3], tuft: [0.28, 0.56, 0.16], flowers: [[1, 1, 1], [0.97, 0.56, 0.7], [1, 0.85, 0.3]] },
  autumn: { dark: [0.68, 0.42, 0.16], light: [0.76, 0.48, 0.2], tuft: [0.55, 0.33, 0.12], flowers: [[0.9, 0.6, 0.2], [0.85, 0.3, 0.15]] },
  winter: { dark: [0.88, 0.92, 0.95], light: [0.94, 0.96, 0.98], tuft: [0.74, 0.82, 0.9], flowers: [[0.65, 0.8, 0.95]] },
  desert: { dark: [0.88, 0.74, 0.45], light: [0.94, 0.8, 0.52], tuft: [0.68, 0.56, 0.3], flowers: [[0.3, 0.62, 0.3]] }
};

const SAND: Record<BiomeType, RGB> = {
  spring: [0.91, 0.85, 0.65],
  autumn: [0.89, 0.8, 0.6],
  winter: [0.85, 0.88, 0.92],
  desert: [0.94, 0.8, 0.52]
};

const SPROUT: Record<BiomeType, RGB> = {
  spring: [0.45, 0.8, 0.22],
  autumn: [0.8, 0.6, 0.15],
  winter: [0.6, 0.8, 0.9],
  desert: [0.65, 0.75, 0.22]
};

const POND: Record<BiomeType, RGB> = {
  spring: [0.1, 0.52, 0.65],
  autumn: [0.1, 0.32, 0.5],
  winter: [0.5, 0.75, 0.9],
  desert: [0.0, 0.68, 0.78]
};

const WATER_DEEP: RGB = [0.04, 0.28, 0.48];
const WATER_SHALLOW: RGB = [0.12, 0.42, 0.62];
const SOIL: RGB = [0.42, 0.27, 0.13];
// Dirt cliff that gives the island visible height (3/4 "raised plateau" look)
const CLIFF_TOP: RGB = [0.56, 0.41, 0.25];
const CLIFF_BODY: RGB = [0.36, 0.24, 0.13];
const CLIFF_DARK: RGB = [0.24, 0.16, 0.09];
const CLIFF_H = 6; // plateau thickness in logical px
const TRUNK: RGB = [0.36, 0.23, 0.14];
const TRUNK_BIRCH: RGB = [0.9, 0.88, 0.84];
const WITHER: RGB = [0.48, 0.38, 0.18];

const ANIMAL_TYPES = new Set<DecorationType>(['deer', 'rabbit']);
const FLAT_DECOR = new Set<DecorationType>(['pond', 'stone_path', 'flowerbed']);

// --- Sprite construction helpers ---

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, style: string) {
  ctx.fillStyle = style;
  ctx.fillRect(x, y, 1, 1);
}

// Build a sprite from a string pixel-map. Unknown chars are transparent.
function fromMap(rows: string[], pal: Record<string, string>): HTMLCanvasElement {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d')!;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (col) px(ctx, x, y, col);
    }
  });
  return c;
}

type TreeStage = 'sapling' | 'full';

function buildTreeSprite(type: TreeType, biome: BiomeType, stage: TreeStage, withered: boolean, completed: boolean): HTMLCanvasElement {
  const W = 16;
  const H = stage === 'full' ? 26 : 18;
  let fol = FOLIAGE[biome][type];
  if (withered) fol = mixRGB(fol, WITHER, 0.85);

  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;

  // 1. Build a foliage mask
  const mask: boolean[] = new Array(W * H).fill(false);
  const inMask = (x: number, y: number) => x >= 0 && x < W && y >= 0 && y < H && mask[y * W + x];
  const set = (x: number, y: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) mask[y * W + x] = true;
  };

  let trunkTop: number;
  if (type === 'pine') {
    // Stacked triangle tiers
    const tiers: Array<[number, number]> = stage === 'full' ? [[1, 4.5], [6, 5.8], [11, 7.0]] : [[1, 3.4], [5, 4.6]];
    const tierH = stage === 'full' ? 6 : 5;
    tiers.forEach(([top, hw]) => {
      for (let dy = 0; dy < tierH; dy++) {
        const half = 0.8 + (dy / (tierH - 1)) * (hw - 0.8);
        for (let x = Math.ceil(8 - half); x < 8 + half; x++) set(x, top + dy);
      }
    });
    trunkTop = stage === 'full' ? 16 : 9;
  } else {
    // Round (bumpy) canopy; sakura is a cluster of blobs
    const blobs: Array<[number, number, number]> =
      type === 'sakura'
        ? stage === 'full'
          ? [[8, 7, 5.4], [4.5, 9.5, 3.6], [11.5, 9.5, 3.6]]
          : [[8, 6, 3.6], [5.5, 8, 2.6], [10.5, 8, 2.6]]
        : stage === 'full'
          ? [[8, 8, 6.1]]
          : [[8, 6, 4.1]];
    blobs.forEach(([bx, by, br]) => {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const dx = x + 0.5 - bx;
          const dy = y + 0.5 - by;
          const rr = br + (hash2(x * 3.7, y * 9.1) - 0.5) * 1.1;
          if (dx * dx + dy * dy <= rr * rr) set(x, y);
        }
      }
    });
    trunkTop = stage === 'full' ? 12 : 9;
  }

  // 2. Trunk (behind foliage edges)
  const trunkCol = type === 'birch' ? TRUNK_BIRCH : TRUNK;
  const tw = stage === 'full' ? 3 : 2;
  for (let y = trunkTop; y < H; y++) {
    for (let i = 0; i < tw; i++) {
      const x = 7 + i;
      let f = i === tw - 1 ? 0.7 : i === 0 ? 1.05 : 0.95;
      if (type === 'birch' && hash2(x * 5.1, y * 3.3) < 0.28) f = 0.35;
      px(ctx, x, y, css(trunkCol, f));
    }
  }
  // Root flare
  px(ctx, 6, H - 1, css(trunkCol, 0.8));
  px(ctx, 7 + tw, H - 1, css(trunkCol, 0.8));

  // 3. Paint foliage with simple top-left lighting + dark outline
  const light = css(fol, 1.22);
  const mid = css(fol);
  const dark = css(fol, 0.72);
  const edge = css(fol, 0.45);
  const cy0 = type === 'pine' ? 9 : 8;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      const isEdge = !inMask(x - 1, y) || !inMask(x + 1, y) || !inMask(x, y - 1) || !inMask(x, y + 1);
      const sh = (x - 8) * 0.55 + (y - cy0) * 0.8 + (hash2(x * 13.3, y * 7.7) - 0.5) * 2.2;
      let col = sh < -1.8 ? light : sh > 2.0 ? dark : mid;
      if (isEdge) col = edge;
      px(ctx, x, y, col);
    }
  }

  // 4. Blossoms / fruit on completed books
  if (completed && !withered) {
    const fruit: RGB = type === 'sakura' ? [1, 1, 1] : type === 'pine' ? [0.95, 0.8, 0.3] : [0.92, 0.18, 0.2];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (mask[y * W + x] && !(!inMask(x - 1, y) || !inMask(x + 1, y) || !inMask(x, y - 1) || !inMask(x, y + 1)) && hash2(x * 31.7, y * 17.3) > 0.9) {
          px(ctx, x, y, css(fruit));
        }
      }
    }
  }

  return c;
}

function buildSproutSprite(biome: BiomeType): HTMLCanvasElement {
  const c = makeCanvas(8, 9);
  const ctx = c.getContext('2d')!;
  const col = SPROUT[biome];
  const stem = css(col, 0.75);
  const leaf = css(col);
  const leafL = css(col, 1.25);
  px(ctx, 4, 4, stem);
  px(ctx, 4, 5, stem);
  px(ctx, 4, 6, stem);
  px(ctx, 4, 7, stem);
  px(ctx, 3, 3, leaf);
  px(ctx, 2, 4, leafL);
  px(ctx, 5, 3, leaf);
  px(ctx, 6, 4, leaf);
  px(ctx, 4, 2, leafL);
  return c;
}

function buildStumpSprite(): HTMLCanvasElement {
  const c = makeCanvas(10, 8);
  const ctx = c.getContext('2d')!;
  for (let y = 1; y < 8; y++) {
    for (let x = 2; x < 8; x++) {
      px(ctx, x, y, css(TRUNK, x >= 6 ? 0.7 : 1));
    }
  }
  // Light cut-surface ring on top
  for (let x = 2; x < 8; x++) px(ctx, x, 1, css([0.78, 0.62, 0.42]));
  px(ctx, 4, 1, css([0.6, 0.45, 0.28]));
  px(ctx, 5, 1, css([0.6, 0.45, 0.28]));
  px(ctx, 1, 7, css(TRUNK, 0.8));
  px(ctx, 8, 7, css(TRUNK, 0.8));
  return c;
}

function buildLanternSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '..OOO..',
      '.OYYYO.',
      '.OYyYO.',
      '.OYYYO.',
      '..OOO..',
      '...M...',
      '...M...',
      '...M...',
      '...M...',
      '...M...',
      '...M...',
      '...M...',
      '...M...',
      '..MMM..',
      '.MMMMM.'
    ],
    { O: '#1a1a20', M: '#2c2c34', Y: '#ffd24d', y: '#fff4bd' }
  );
}

function buildBenchSprite(): HTMLCanvasElement {
  return fromMap(
    [
      'OOOOOOOOOOOOOO',
      'OWWWWWWWWWWWWO',
      'OWWWWWWWWWWWWO',
      'OwwwwwwwwwwwwO',
      'OOOOOOOOOOOOOO',
      '.Ow........wO.',
      '.Ow........wO.',
      '.OO........OO.'
    ],
    { O: '#3b2410', W: '#b5814a', w: '#8a5a2b' }
  );
}

function buildDeerSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '..h.h...........',
      '..hhh...........',
      '..OBBO..........',
      '..OBkBO.........',
      '...OBBOOOOOOO...',
      '...OBBBBBBBBBO..',
      '....OBBBBBBBBOW.',
      '....OBLLLLLBBBO.',
      '....OBBBBBBBBO..',
      '....OB.OBB.OB...',
      '....OB.OB..OB...',
      '....OO.OO..OO...'
    ],
    { O: '#3a2a18', B: '#8a5d3b', L: '#a9794f', k: '#15100a', h: '#6e4f2e', W: '#f5ead2' }
  );
}

function buildRabbitSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '.OO..OO...',
      '.OPO.OPO..',
      '.OWWOWWO..',
      '.OWkWWWO..',
      'OWWWWWWWO.',
      'OWWWWWWWWO',
      '.OWWWWWWO.',
      '..OO..OO..'
    ],
    { O: '#6e5a50', W: '#f4f1ee', P: '#f0a8b8', k: '#1a1a1a' }
  );
}

function buildPondSprite(biome: BiomeType): HTMLCanvasElement {
  const W = 30;
  const H = 20;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;
  const water = POND[biome];
  const rx = 13.5;
  const ry = 8.5;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - W / 2) / rx;
      const dy = (y + 0.5 - H / 2) / ry;
      const d = dx * dx + dy * dy;
      if (d <= 1) {
        let col = css(water);
        if (d > 0.72) col = css(water, 0.78);
        if (hash2(x * 11.3, y * 23.1) > 0.93) col = css(water, 1.35);
        px(ctx, x, y, col);
      } else if (d <= 1.32) {
        px(ctx, x, y, css([0.43, 0.32, 0.2]));
      }
    }
  }
  // Stone rim
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.4;
    const sx = Math.round(W / 2 + Math.cos(a) * rx) - 1;
    const sy = Math.round(H / 2 + Math.sin(a) * ry) - 1;
    const g = 0.45 + hash2(i * 3.1, i * 7.7) * 0.15;
    ctx.fillStyle = css([g, g + 0.03, g + 0.05]);
    ctx.fillRect(sx, sy, 2, 2);
  }
  // Lily pad
  px(ctx, Math.round(W * 0.62), Math.round(H * 0.42), css([0.3, 0.65, 0.28]));
  px(ctx, Math.round(W * 0.62) + 1, Math.round(H * 0.42), css([0.36, 0.74, 0.32]));
  return c;
}

function buildHouseSprite(): HTMLCanvasElement {
  const W = 28;
  const H = 26;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;

  const wall: RGB = [0.93, 0.86, 0.66]; // cream plaster
  const wallSh: RGB = [0.82, 0.73, 0.52];
  const beam: RGB = [0.45, 0.29, 0.15]; // timber frame
  const roof: RGB = [0.74, 0.28, 0.22]; // red shingles
  const roofSh: RGB = [0.58, 0.2, 0.16];
  const roofEdge: RGB = [0.34, 0.16, 0.12];
  const door: RGB = [0.45, 0.28, 0.14];
  const doorSh: RGB = [0.3, 0.18, 0.09];
  const glass: RGB = [0.5, 0.74, 0.85];
  const glassSh: RGB = [0.32, 0.56, 0.7];
  const dark: RGB = [0.16, 0.1, 0.06];

  const R = (x: number, y: number, w: number, h: number, col: RGB, f = 1) => {
    ctx.fillStyle = css(col, f);
    ctx.fillRect(x, y, w, h);
  };

  const wallTop = 11;

  // Walls (timber-framed cottage)
  R(3, wallTop, W - 6, H - wallTop - 1, wall);
  R(W - 7, wallTop, 4, H - wallTop - 1, wallSh); // right-side shading
  R(3, wallTop, 2, H - wallTop - 1, beam); // left post
  R(W - 5, wallTop, 2, H - wallTop - 1, beam); // right post
  R(3, H - 2, W - 6, 2, beam); // base sill

  // Roof (triangular gable that overhangs the walls)
  for (let y = 0; y < wallTop; y++) {
    const half = 2 + (y / (wallTop - 1)) * (W / 2 - 2);
    const x0 = Math.round(W / 2 - half);
    const x1 = Math.round(W / 2 + half);
    R(x0, y, x1 - x0, 1, y % 2 === 0 ? roof : roofSh);
    px(ctx, x0, y, css(roofEdge)); // dark roof edges
    px(ctx, x1 - 1, y, css(roofEdge));
  }
  R(1, wallTop - 1, W - 2, 1, roofEdge); // eave line

  // Chimney (drawn over the roof slope)
  R(W - 9, 2, 3, 6, [0.4, 0.24, 0.2]);
  R(W - 9, 2, 3, 1, dark);

  // Door
  const dw = 6;
  const dh = 9;
  const dx = Math.round(W * 0.34 - dw / 2);
  R(dx, H - 1 - dh, dw, dh, door);
  R(dx, H - 1 - dh, 2, dh, doorSh);
  R(dx, H - 1 - dh, dw, 1, dark); // lintel
  px(ctx, dx + dw - 2, H - 1 - Math.round(dh / 2), css([0.95, 0.8, 0.3])); // knob

  // Window with mullions
  const wx = Math.round(W * 0.62);
  const wy = wallTop + 3;
  const ww = 6;
  const wh = 6;
  R(wx, wy, ww, wh, glass);
  R(wx, wy + wh - 2, ww, 2, glassSh);
  R(wx - 1, wy - 1, ww + 2, 1, beam);
  R(wx - 1, wy + wh, ww + 2, 1, beam);
  R(wx - 1, wy - 1, 1, wh + 2, beam);
  R(wx + ww, wy - 1, 1, wh + 2, beam);
  R(wx + Math.floor(ww / 2), wy, 1, wh, beam);
  R(wx, wy + Math.floor(wh / 2), ww, 1, beam);

  return c;
}

function buildStonePathSprite(): HTMLCanvasElement {
  const c = makeCanvas(16, 10);
  const ctx = c.getContext('2d')!;
  const blob = (cx: number, cy: number, rx: number, ry: number, seed: number) => {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 16; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) {
          const g = 0.46 + (hash2(x * 7.7 + seed, y * 13.1) - 0.5) * 0.1 - dy * 0.06;
          px(ctx, x, y, css([g, g + 0.02, g + 0.04]));
        }
      }
    }
  };
  blob(5, 4, 4.5, 3.2, 1);
  blob(11.5, 6.5, 3.6, 2.6, 9);
  return c;
}

function buildFenceSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '.O...O...O...O',
      'OWO.OWO.OWO.OW',
      'OWO.OWO.OWO.OW',
      'wwwwwwwwwwwwww',
      'OWO.OWO.OWO.OW',
      'OWO.OWO.OWO.OW',
      'wwwwwwwwwwwwww',
      'OWO.OWO.OWO.OW',
      '.O...O...O...O'
    ],
    { O: '#5a3a1c', W: '#9c6b3a', w: '#7a4f29' }
  );
}

function buildMushroomSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '..rrrr....',
      '.rRRRRr...',
      'rRRwwRRr..',
      'rRwwwwRr..',
      'rRRRRRRr..',
      '.rRRRRr...',
      '...WW.....',
      '..WWWW....',
      '..WWWW....'
    ],
    { r: '#a01818', R: '#d62828', w: '#ffe0e0', W: '#ece0c2' }
  );
}

function buildSignpostSprite(): HTMLCanvasElement {
  return fromMap(
    [
      'OOOOOOOO..',
      'OWWWWWWO..',
      'OWaaaaWO..',
      'OWaWWaWO..',
      'OWaaaaWO..',
      'OWWWWWWO..',
      'OOOOOOOO..',
      '...MM.....',
      '...MM.....',
      '...MM.....',
      '...MM.....',
      '...MM.....',
      '..MMMM....',
      '..MMMM....'
    ],
    { O: '#3b2410', W: '#b5814a', a: '#e8d2a8', M: '#5a3a1c' }
  );
}

function buildWellSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '....rrrrrr....',
      '...rrrrrrrr...',
      '..rrrrrrrrrr..',
      '.rrrrrrrrrrrr.',
      'rrrrrrrrrrrrrr',
      '....M....M....',
      '....M....M....',
      '..SSSSSSSSSS..',
      '..SwwwwwwwwS..',
      '..SwBBBBBBwS..',
      '..SwBBBBBBwS..',
      '..SwBBBBBBwS..',
      '..SwwwwwwwwS..',
      '..SSSSSSSSSS..',
      '..SS.SS.SSS...',
      '...SSSSSSSS...',
      '....SSSSSS....'
    ],
    { r: '#8a2b22', M: '#5a3a1c', S: '#9a9a9a', w: '#6a6a6a', B: '#1a5a8a' }
  );
}

function buildScarecrowSprite(): HTMLCanvasElement {
  return fromMap(
    [
      '....hhhh....',
      '...hhhhhh...',
      '....SSSS....',
      '...SSSSSS...',
      '...SkSSkS...',
      '...SSSSSS...',
      '....SSSS....',
      'WWWWWWWWWWWW',
      '....CCCC....',
      '....CCCC....',
      '...CCCCCC...',
      '...CCCCCC...',
      '....CCCC....',
      '....MMMM....',
      '.....MM.....',
      '.....MM.....',
      '.....MM.....',
      '.....MM.....'
    ],
    { h: '#6b4423', S: '#e8d27a', k: '#1a1a1a', W: '#7a4a28', C: '#5a8a3a', M: '#5a3a1c' }
  );
}

// Flat flowerbed patch that sits on the plateau top (like a pond / stone path).
function buildFlowerbedSprite(biome: BiomeType): HTMLCanvasElement {
  const W = 20;
  const H = 13;
  const c = makeCanvas(W, H);
  const ctx = c.getContext('2d')!;
  const rx = 9.5;
  const ry = 6.0;
  // Tilled soil oval border
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - W / 2) / rx;
      const dy = (y + 0.5 - H / 2) / ry;
      const d = dx * dx + dy * dy;
      if (d <= 1) {
        const g = 0.4 + (hash2(x * 5.3, y * 9.1) - 0.5) * 0.12;
        px(ctx, x, y, css([g, g * 0.65, g * 0.4]));
      }
    }
  }
  // Flower dots drawn from the biome flower palette
  const flowers = GRASS[biome].flowers;
  for (let i = 0; i < 14; i++) {
    const a = hash2(i * 3.1, 7.7) * Math.PI * 2;
    const r = hash2(i * 9.3, 1.7);
    const fx = Math.round(W / 2 + Math.cos(a) * rx * 0.72 * r);
    const fy = Math.round(H / 2 + Math.sin(a) * ry * 0.72 * r);
    const f = flowers[Math.floor(hash2(i * 2.2, 5.5) * flowers.length)];
    px(ctx, fx, fy, css(f, 1.1));
    px(ctx, fx + 1, fy, css(f, 0.85));
    px(ctx, fx, fy - 1, css([0.3, 0.6, 0.28]));
  }
  return c;
}

interface WeatherParticle {
  x: number; // 0..1 of viewport width
  y: number; // 0..1 of viewport height
  speed: number;
  sway: number;
}

interface DrawEntity {
  id: string;
  kind: 'tree' | 'decor';
  lx: number; // logical world px (anchor: bottom-center foot)
  lz: number;
  spr: HTMLCanvasElement;
  sway: boolean;
  flip: boolean;
  hop: number; // extra lift in logical px (hopping animals)
  dragging: boolean;
  seed: number;
  biome: BiomeType | null; // foliage biome lock for trees, null otherwise
  completed: boolean; // finished book → permanent trophy sparkle
}

// Wander state for autonomous animals (visual only; not persisted)
interface AnimalState {
  x: number; // current grid position
  z: number;
  tx: number; // target grid position
  tz: number;
  pause: number;
  facing: number; // -1 left, 1 right
  hop: number;
}

// In-progress drag of a garden object
interface DragState {
  kind: 'tree' | 'decor';
  id: string;
  grabLx: number; // logical px offset between foot and cursor at pickup
  grabLz: number;
  gridX: number; // live snapped grid position
  gridZ: number;
  origX: number;
  origZ: number;
  biome: BiomeType | null; // biome lock for trees
  valid: boolean;
  moved: boolean;
}

// Screen-space hit rectangle recorded each frame for pointer picking
interface HitEntity {
  id: string;
  kind: 'tree' | 'decor';
  x0: number;
  y0: number;
  w: number;
  h: number;
  ax: number; // anchor logical x (foot)
  az: number;
  biome: BiomeType | null;
}

export class PixelRenderer {
  private parent: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private light: HTMLCanvasElement;
  private lctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private dpr: number;
  private running = true;
  private time = 0;

  // Scene data
  private trees: Tree[] = [];
  private decorations: Decoration[] = [];
  private timeOfDay: 'day' | 'night' = 'day';
  private weather: 'clear' | 'rainy' | 'snowy' = 'clear';

  // Editing (drag to reposition). Disabled while visiting a friend's forest.
  private editable = false;
  private onMoveTree: (id: string, x: number, z: number) => void = () => {};
  private onMoveDecoration: (id: string, x: number, z: number) => void = () => {};

  // Smoothly interpolated darkness (0 = day, ~0.62 = night)
  private ambient = 0;

  // Camera (logical world px, island center = origin)
  private camX = 0;
  private camY = 10;
  private zoom = 3;
  private isDragging = false; // camera pan
  private lastMouseX = 0;
  private lastMouseY = 0;

  private spriteCache = new Map<string, HTMLCanvasElement>();
  private particles: WeatherParticle[] = [];
  private animals = new Map<string, AnimalState>();
  private drag: DragState | null = null;
  private lastEntities: HitEntity[] = [];
  private zoomInit = false;
  private cleanupInput: () => void = () => {};

  // Manual placement mode: a ghost decoration follows the cursor until the
  // player clicks a valid tile (or cancels with Esc / right-click).
  private placementType: DecorationType | null = null;
  private placeGridX = 0;
  private placeGridZ = 0;
  private placeValid = false;
  private placeDownX = 0;
  private placeDownY = 0;
  private onPlaceDecoration: (type: DecorationType, x: number, z: number) => void = () => {};
  private onCancelPlacement: () => void = () => {};

  constructor(parent: HTMLDivElement, width: number, height: number) {
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas = document.createElement('canvas');
    this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(height * this.dpr));
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.cursor = 'grab';
    this.parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    this.light = makeCanvas(this.canvas.width, this.canvas.height);
    this.lctx = this.light.getContext('2d')!;

    this.initInput();
    for (let i = 0; i < 220; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.55 + Math.random() * 0.5,
        sway: Math.random() * Math.PI * 2
      });
    }
  }

  public async init() {
    requestAnimationFrame(() => this.tick());
  }

  public updateData(
    trees: Tree[],
    decorations: Decoration[],
    timeOfDay: 'day' | 'night',
    weather: 'clear' | 'rainy' | 'snowy',
    _biome: BiomeType,
    editable = false,
    onMoveTree?: (id: string, x: number, z: number) => void,
    onMoveDecoration?: (id: string, x: number, z: number) => void
  ) {
    this.trees = trees;
    this.decorations = decorations;
    this.timeOfDay = timeOfDay;
    this.weather = weather;
    this.editable = editable;
    if (onMoveTree) this.onMoveTree = onMoveTree;
    if (onMoveDecoration) this.onMoveDecoration = onMoveDecoration;
    if (this.placementType) {
      this.canvas.style.cursor = 'copy';
    } else if (!editable) {
      this.drag = null;
      this.canvas.style.cursor = 'default';
    } else if (!this.isDragging && !this.drag) {
      this.canvas.style.cursor = 'grab';
    }
  }

  // Enter / leave manual placement mode (driven by the shop "place" action).
  public setPlacement(
    type: DecorationType | null,
    onPlace?: (type: DecorationType, x: number, z: number) => void,
    onCancel?: () => void
  ) {
    this.placementType = type;
    if (onPlace) this.onPlaceDecoration = onPlace;
    if (onCancel) this.onCancelPlacement = onCancel;
    if (type) {
      this.drag = null;
      this.canvas.style.cursor = 'copy';
    } else {
      this.canvas.style.cursor = this.editable ? 'grab' : 'default';
    }
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = Math.max(1, Math.floor(width * this.dpr));
    this.canvas.height = Math.max(1, Math.floor(height * this.dpr));
    this.light.width = this.canvas.width;
    this.light.height = this.canvas.height;
  }

  public destroy() {
    this.running = false;
    this.cleanupInput();
    this.canvas.remove();
  }

  // Snapshot the current garden frame as a PNG data URL (for sharing).
  public captureDataURL(): string {
    try {
      return this.canvas.toDataURL('image/png');
    } catch {
      return '';
    }
  }

  // --- Coordinate helpers ---------------------------------------------------

  // Island radius in tiles — grows with the garden (shared with the shop)
  private tileLimit(): number {
    return islandTileRadius(this.trees.length + this.decorations.length);
  }

  // Rounded, slightly noisy coastline (Euclidean instead of a hard diamond)
  private landDist(gx: number, gz: number): number {
    return Math.hypot(gx, gz) + (hash2(gx * 0.7, gz * 0.7) - 0.5) * 2.0;
  }

  private isLand(gx: number, gz: number): boolean {
    return this.landDist(gx, gz) <= this.tileLimit();
  }

  // Zoom range tied to the island size: at minimum zoom the whole island
  // (plus beach + a little margin) just fits the viewport, so you can never
  // pull back so far that the land becomes a speck in the ocean.
  private zoomBounds(): { min: number; max: number } {
    const limit = this.tileLimit();
    const islandPx = (2 * limit + 4) * TILE; // diameter incl. beach ring + margin
    const fit = Math.min(this.width, this.height) / islandPx;
    const min = Math.max(0.5, fit);
    return { min, max: min * 3.5 };
  }

  // Screen px (CSS units, canvas-relative). Land is lifted by the plateau height.
  private sx(lx: number): number {
    return (lx - this.camX) * this.zoom + this.width / 2;
  }
  private syBase(lz: number): number {
    return (lz - this.camY) * this.zoom + this.height / 2;
  }
  private get lift(): number {
    return Math.round(CLIFF_H * this.zoom);
  }

  // --- Input: hit-test for object drag, else pan; wheel to zoom -------------

  private initInput() {
    const localPt = (clientX: number, clientY: number) => {
      const r = this.canvas.getBoundingClientRect();
      return { mx: clientX - r.left, my: clientY - r.top };
    };

    const onDown = (clientX: number, clientY: number) => {
      const { mx, my } = localPt(clientX, clientY);
      if (this.placementType) {
        // Track for click-vs-pan discrimination; ghost is already following.
        this.placeDownX = clientX;
        this.placeDownY = clientY;
        this.isDragging = true;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
        this.updatePlacement(mx, my);
        return;
      }
      const hit = this.editable ? this.hitTest(mx, my) : null;
      if (hit) {
        this.startObjectDrag(hit, mx, my);
        this.canvas.style.cursor = 'grabbing';
      } else {
        this.isDragging = true;
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
        this.canvas.style.cursor = 'grabbing';
      }
    };

    const onMove = (clientX: number, clientY: number) => {
      if (this.placementType) {
        const { mx, my } = localPt(clientX, clientY);
        this.updatePlacement(mx, my);
        if (this.isDragging) {
          this.pan(clientX - this.lastMouseX, clientY - this.lastMouseY);
          this.lastMouseX = clientX;
          this.lastMouseY = clientY;
        }
        return;
      }
      if (this.drag) {
        const { mx, my } = localPt(clientX, clientY);
        this.updateObjectDrag(mx, my);
      } else if (this.isDragging) {
        this.pan(clientX - this.lastMouseX, clientY - this.lastMouseY);
        this.lastMouseX = clientX;
        this.lastMouseY = clientY;
      }
    };

    const onUp = () => {
      if (this.placementType) {
        const dist = Math.hypot(this.lastMouseX - this.placeDownX, this.lastMouseY - this.placeDownY);
        // A near-stationary release is a "place" click; a long drag was a pan.
        if (dist < 6 && this.placeValid) {
          this.onPlaceDecoration(this.placementType, this.placeGridX, this.placeGridZ);
        }
        this.isDragging = false;
        return;
      }
      if (this.drag) this.commitDrag();
      this.isDragging = false;
      this.canvas.style.cursor = this.editable ? 'grab' : 'default';
    };

    const onMouseDown = (e: MouseEvent) => onDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onMouseUp = () => onUp();
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { min, max } = this.zoomBounds();
      const step = (e.deltaY > 0 ? -1 : 1) * (max - min) * 0.12;
      this.zoom = Math.max(min, Math.min(max, this.zoom + step));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      if (this.drag || this.isDragging) e.preventDefault();
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => onUp();

    // Right-click or Escape cancels an in-progress placement (no purchase made).
    const onContextMenu = (e: MouseEvent) => {
      if (this.placementType) {
        e.preventDefault();
        this.onCancelPlacement();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.placementType) this.onCancelPlacement();
    };

    this.canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    this.canvas.addEventListener('wheel', onWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    this.canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    this.cleanupInput = () => {
      this.canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.canvas.removeEventListener('wheel', onWheel);
      this.canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      this.canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }

  private pan(dxCss: number, dyCss: number) {
    const bound = (this.tileLimit() + 4) * TILE;
    this.camX = Math.max(-bound, Math.min(bound, this.camX - dxCss / this.zoom));
    this.camY = Math.max(-bound, Math.min(bound, this.camY - dyCss / this.zoom));
  }

  // Topmost editable object under the cursor (front-to-back)
  private hitTest(mx: number, my: number): HitEntity | null {
    for (let i = this.lastEntities.length - 1; i >= 0; i--) {
      const e = this.lastEntities[i];
      if (mx >= e.x0 && mx <= e.x0 + e.w && my >= e.y0 && my <= e.y0 + e.h) return e;
    }
    return null;
  }

  private startObjectDrag(hit: HitEntity, mx: number, my: number) {
    // World point under cursor (plateau-relative; the constant lift cancels out
    // because the same conversion is used for pickup and move).
    const worldX = (mx - this.width / 2) / this.zoom + this.camX;
    const worldZ = (my - this.height / 2) / this.zoom + this.camY + CLIFF_H;
    const gridX = hit.ax / (2 * TILE);
    const gridZ = hit.az / (2 * TILE);
    this.drag = {
      kind: hit.kind,
      id: hit.id,
      grabLx: hit.ax - worldX,
      grabLz: hit.az - worldZ,
      gridX,
      gridZ,
      origX: gridX,
      origZ: gridZ,
      biome: hit.biome,
      valid: true,
      moved: false
    };
  }

  private updateObjectDrag(mx: number, my: number) {
    if (!this.drag) return;
    const worldX = (mx - this.width / 2) / this.zoom + this.camX;
    const worldZ = (my - this.height / 2) / this.zoom + this.camY + CLIFF_H;
    const lx = worldX + this.drag.grabLx;
    const lz = worldZ + this.drag.grabLz;
    const snap = (v: number) => Math.round((v / (2 * TILE)) * 2) / 2; // snap to tile centers (0.5 grid)
    const gx = snap(lx);
    const gz = snap(lz);
    if (gx !== this.drag.gridX || gz !== this.drag.gridZ) this.drag.moved = true;
    this.drag.gridX = gx;
    this.drag.gridZ = gz;

    const tx = Math.round(gx * 2);
    const tz = Math.round(gz * 2);
    const onLand = this.isLand(tx, tz);
    const biomeOk = this.drag.biome ? getBiomeAt(tx, tz) === this.drag.biome : true;
    this.drag.valid = onLand && biomeOk;
  }

  // Live-update the ghost decoration's snapped grid position + validity.
  private updatePlacement(mx: number, my: number) {
    if (!this.placementType) return;
    const worldX = (mx - this.width / 2) / this.zoom + this.camX;
    const worldZ = (my - this.height / 2) / this.zoom + this.camY + CLIFF_H;
    const snap = (v: number) => Math.round((v / (2 * TILE)) * 2) / 2;
    this.placeGridX = snap(worldX);
    this.placeGridZ = snap(worldZ);
    const tx = Math.round(this.placeGridX * 2);
    const tz = Math.round(this.placeGridZ * 2);
    this.placeValid = this.isLand(tx, tz);
  }

  private commitDrag() {
    const d = this.drag;
    this.drag = null;
    if (!d || !d.moved) return;
    if (!d.valid) return; // invalid drop → snap back (context unchanged)

    if (d.kind === 'tree') {
      this.onMoveTree(d.id, d.gridX, d.gridZ);
    } else {
      this.onMoveDecoration(d.id, d.gridX, d.gridZ);
      // Re-home a wandering animal at its new spot
      const st = this.animals.get(d.id);
      if (st) {
        st.x = d.gridX;
        st.z = d.gridZ;
        st.tx = d.gridX;
        st.tz = d.gridZ;
        st.pause = 0.5;
      }
    }
  }

  // --- Animal wander (autonomous movement near each animal's home) ----------

  private updateAnimals(dt: number) {
    const limit = this.tileLimit();
    this.decorations.forEach((d) => {
      if (!ANIMAL_TYPES.has(d.type)) return;

      let st = this.animals.get(d.id);
      if (!st) {
        st = { x: d.x, z: d.z, tx: d.x, tz: d.z, pause: Math.random() * 2, facing: 1, hop: 0 };
        this.animals.set(d.id, st);
      }
      if (this.drag && this.drag.id === d.id) {
        st.hop = 0;
        return;
      }

      const isRabbit = d.type === 'rabbit';
      const speed = isRabbit ? 1.7 : 0.9;
      const radius = isRabbit ? 1.9 : 1.4;

      if (st.pause > 0) {
        st.pause -= dt;
        st.hop = 0;
        return;
      }

      const dx = st.tx - st.x;
      const dz = st.tz - st.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 0.04) {
        // Arrived — rest a beat, then choose a fresh target near home (on land)
        st.pause = 0.6 + Math.random() * 2.4;
        st.hop = 0;
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * radius;
          const nx = d.x + Math.cos(a) * r;
          const nz = d.z + Math.sin(a) * r;
          const tx = Math.round(nx * 2);
          const tz = Math.round(nz * 2);
          if (this.landDist(tx, tz) <= limit - 1) {
            st.tx = nx;
            st.tz = nz;
            break;
          }
        }
      } else {
        const stepLen = Math.min(dist, speed * dt);
        st.x += (dx / dist) * stepLen;
        st.z += (dz / dist) * stepLen;
        if (Math.abs(dx) > 0.01) st.facing = dx < 0 ? -1 : 1;
        st.hop = isRabbit ? Math.abs(Math.sin(this.time * 9)) * 1.6 : Math.abs(Math.sin(this.time * 5)) * 0.4;
      }
    });
  }

  // --- Sprite cache accessors ----------------------------------------------

  private cached(key: string, build: () => HTMLCanvasElement): HTMLCanvasElement {
    let spr = this.spriteCache.get(key);
    if (!spr) {
      spr = build();
      this.spriteCache.set(key, spr);
    }
    return spr;
  }

  private getTreeSprite(tree: Tree, biome: BiomeType): HTMLCanvasElement {
    if (tree.vitality <= 0.05) return this.cached('stump', buildStumpSprite);
    if (tree.growth < 0.18) return this.cached(`sprout|${biome}`, () => buildSproutSprite(biome));
    const stage: TreeStage = tree.growth < 0.55 ? 'sapling' : 'full';
    const withered = tree.vitality < 0.5;
    const completed = tree.growth >= 0.99 && stage === 'full';
    const key = `tree|${tree.type}|${biome}|${stage}|${withered ? 1 : 0}|${completed ? 1 : 0}`;
    return this.cached(key, () => buildTreeSprite(tree.type, biome, stage, withered, completed));
  }

  private getDecorSprite(type: DecorationType, biome: BiomeType): HTMLCanvasElement {
    switch (type) {
      case 'lantern':
        return this.cached('lantern', buildLanternSprite);
      case 'bench':
        return this.cached('bench', buildBenchSprite);
      case 'deer':
        return this.cached('deer', buildDeerSprite);
      case 'rabbit':
        return this.cached('rabbit', buildRabbitSprite);
      case 'pond':
        return this.cached(`pond|${biome}`, () => buildPondSprite(biome));
      case 'stone_path':
        return this.cached('stone_path', buildStonePathSprite);
      case 'house':
        return this.cached('house', buildHouseSprite);
      case 'fence':
        return this.cached('fence', buildFenceSprite);
      case 'mushroom':
        return this.cached('mushroom', buildMushroomSprite);
      case 'signpost':
        return this.cached('signpost', buildSignpostSprite);
      case 'well':
        return this.cached('well', buildWellSprite);
      case 'scarecrow':
        return this.cached('scarecrow', buildScarecrowSprite);
      case 'flowerbed':
        return this.cached(`flowerbed|${biome}`, () => buildFlowerbedSprite(biome));
    }
  }

  // --- Ground tile builders (16x16, cached) --------------------------------

  private grassTile(biome: BiomeType, checker: number, variant: number): HTMLCanvasElement {
    return this.cached(`grass|${biome}|${checker}|${variant}`, () => {
      const c = makeCanvas(TILE, TILE);
      const ctx = c.getContext('2d')!;
      const g = GRASS[biome];
      const base = checker ? g.dark : g.light;
      ctx.fillStyle = css(base);
      ctx.fillRect(0, 0, TILE, TILE);
      // Speckle noise
      for (let i = 0; i < 14; i++) {
        const x = Math.floor(hash2(i * 3.3, variant * 7.1 + checker) * TILE);
        const y = Math.floor(hash2(i * 9.7, variant * 5.3) * TILE);
        px(ctx, x, y, css(base, hash2(i, variant) > 0.5 ? 1.08 : 0.92));
      }
      // Grass tufts
      if (variant >= 1) {
        for (let t = 0; t < 2 + variant; t++) {
          const x = 2 + Math.floor(hash2(t * 13.1, variant * 3.7) * (TILE - 4));
          const y = 3 + Math.floor(hash2(t * 7.9, variant * 11.3) * (TILE - 6));
          px(ctx, x, y, css(g.tuft));
          px(ctx, x, y + 1, css(g.tuft));
          px(ctx, x + 1, y + 1, css(g.tuft, 1.15));
        }
      }
      // Flowers on the lushest variant
      if (variant === 3) {
        const f = g.flowers[Math.floor(hash2(checker * 5.5, variant) * g.flowers.length)];
        px(ctx, 4, 5, css(f));
        px(ctx, 5, 5, css(f, 0.85));
        px(ctx, 4, 6, css(g.tuft));
        px(ctx, 11, 10, css(f, 1.05));
        px(ctx, 11, 11, css(g.tuft));
      }
      return c;
    });
  }

  private sandTile(biome: BiomeType): HTMLCanvasElement {
    return this.cached(`sand|${biome}`, () => {
      const c = makeCanvas(TILE, TILE);
      const ctx = c.getContext('2d')!;
      const base = SAND[biome];
      ctx.fillStyle = css(base);
      ctx.fillRect(0, 0, TILE, TILE);
      for (let i = 0; i < 16; i++) {
        const x = Math.floor(hash2(i * 5.7, 2.2) * TILE);
        const y = Math.floor(hash2(i * 3.1, 8.8) * TILE);
        px(ctx, x, y, css(base, i % 2 ? 1.06 : 0.9));
      }
      return c;
    });
  }

  private waterTile(shallow: boolean): HTMLCanvasElement {
    return this.cached(`water|${shallow ? 's' : 'd'}`, () => {
      const c = makeCanvas(TILE, TILE);
      const ctx = c.getContext('2d')!;
      const base = shallow ? WATER_SHALLOW : WATER_DEEP;
      ctx.fillStyle = css(base);
      ctx.fillRect(0, 0, TILE, TILE);
      for (let i = 0; i < 6; i++) {
        const x = Math.floor(hash2(i * 7.3, 4.4) * TILE);
        const y = Math.floor(hash2(i * 2.9, 6.6) * TILE);
        px(ctx, x, y, css(base, 1.12));
      }
      return c;
    });
  }

  private cropTile(biome: BiomeType): HTMLCanvasElement {
    return this.cached(`crop|${biome}`, () => {
      const c = makeCanvas(TILE, TILE);
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = css(SOIL);
      ctx.fillRect(0, 0, TILE, TILE);
      // Tilled rows
      for (const y of [3, 7, 11]) {
        ctx.fillStyle = css(SOIL, 0.72);
        ctx.fillRect(1, y, TILE - 2, 1);
      }
      ctx.fillStyle = css(SOIL, 0.55);
      ctx.fillRect(0, 0, TILE, 1);
      ctx.fillRect(0, 0, 1, TILE);
      // Two small sprouts
      const sp = SPROUT[biome];
      for (const [sx, sy] of [[4, 4], [10, 8]] as Array<[number, number]>) {
        px(ctx, sx, sy, css(sp));
        px(ctx, sx, sy + 1, css(sp, 0.8));
        px(ctx, sx - 1, sy, css(sp, 1.2));
        px(ctx, sx + 1, sy - 1, css(sp, 1.1));
      }
      return c;
    });
  }

  private groundTileFor(gx: number, gz: number, limit: number): HTMLCanvasElement {
    const biome = getBiomeAt(gx, gz);
    if (gx >= 1 && gx <= 3 && gz >= 1 && gz <= 3) return this.cropTile(biome);
    if (this.landDist(gx, gz) > limit - 1.4) return this.sandTile(biome);
    const variant = Math.floor(hash2(gx * 1.7, gz * 2.3) * 4);
    return this.grassTile(biome, (gx + gz) & 1, variant);
  }

  // --- Main loop -----------------------------------------------------------

  private tick() {
    if (!this.running) return;
    const dt = 1 / 60;
    this.time += dt;

    // Keep zoom within the island-fitted range (recomputed as the island grows,
    // shrinks, or the window resizes). Start fully fitted to the land.
    const { min, max } = this.zoomBounds();
    if (!this.zoomInit) {
      this.zoom = min;
      this.zoomInit = true;
    }
    this.zoom = Math.max(min, Math.min(max, this.zoom));

    const targetAmbient = this.timeOfDay === 'night' ? 0.62 : 0;
    this.ambient += (targetAmbient - this.ambient) * 0.05;

    this.updateAnimals(dt);
    this.draw();
    requestAnimationFrame(() => this.tick());
  }

  private draw() {
    const ctx = this.ctx;
    const cw = this.width;
    const chh = this.height;
    const zoom = this.zoom;
    const limit = this.tileLimit();
    const lift = this.lift;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const sx = (lx: number) => this.sx(lx);
    const syB = (lz: number) => this.syBase(lz);
    const syL = (lz: number) => this.syBase(lz) - lift;

    const gx0 = Math.floor((this.camX - cw / 2 / zoom) / TILE) - 1;
    const gx1 = Math.ceil((this.camX + cw / 2 / zoom) / TILE) + 1;
    const gz0 = Math.floor((this.camY - chh / 2 / zoom) / TILE) - 1;
    const gz1 = Math.ceil((this.camY + chh / 2 / zoom) / TILE) + 1;
    const waveStep = Math.floor(this.time * 1.3);

    // Clear to ocean color (covers areas beyond tiles)
    ctx.fillStyle = css(WATER_DEEP);
    ctx.fillRect(0, 0, cw, chh);

    // PASS 1 — water (drawn first so the cliffs can overhang it)
    for (let gz = gz0; gz <= gz1; gz++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        if (this.isLand(gx, gz)) continue;
        const x0 = Math.round(sx(gx * TILE));
        const y0 = Math.round(syB(gz * TILE));
        const w = Math.round(sx((gx + 1) * TILE)) - x0;
        const h = Math.round(syB((gz + 1) * TILE)) - y0;
        const shallow = this.landDist(gx, gz) <= limit + 1.1;
        ctx.drawImage(this.waterTile(shallow), x0, y0, w, h);
        if (hash2(gx * 7.3, gz * 13.7 + waveStep) > 0.93) {
          ctx.fillStyle = css(WATER_DEEP, 1.9);
          ctx.fillRect(x0 + Math.round(4 * zoom), y0 + Math.round(7 * zoom), Math.round(3 * zoom), Math.max(1, Math.round(zoom * 0.8)));
        }
      }
    }

    // PASS 2 — land (lifted onto the plateau) plus dirt cliffs at the edges
    const lipH = Math.max(1, Math.round(zoom));
    for (let gz = gz0; gz <= gz1; gz++) {
      for (let gx = gx0; gx <= gx1; gx++) {
        if (!this.isLand(gx, gz)) continue;
        const x0 = Math.round(sx(gx * TILE));
        const y0 = Math.round(syL(gz * TILE));
        const x1 = Math.round(sx((gx + 1) * TILE));
        const y1 = Math.round(syL((gz + 1) * TILE));
        const w = x1 - x0;
        const h = y1 - y0;
        ctx.drawImage(this.groundTileFor(gx, gz, limit), x0, y0, w, h);

        // South-facing cliff (camera-facing): land here, water just below
        if (!this.isLand(gx, gz + 1)) {
          ctx.fillStyle = css(CLIFF_TOP);
          ctx.fillRect(x0, y1, w, lipH);
          ctx.fillStyle = css(CLIFF_BODY);
          ctx.fillRect(x0, y1 + lipH, w, lift - lipH);
          // Vertical streaks for texture
          for (let s = 0; s < w; s += Math.max(2, Math.round(3 * zoom))) {
            if (hash2(gx * 4.1 + s, gz * 9.3) > 0.55) {
              ctx.fillStyle = css(CLIFF_DARK);
              ctx.fillRect(x0 + s, y1 + lipH, Math.max(1, Math.round(zoom * 0.6)), lift - lipH);
            }
          }
          // Soft shadow cast on the water at the base
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(x0, y1 + lift, w, lipH);
        }
        // East / west side walls give the plateau some thickness on the flanks
        if (!this.isLand(gx + 1, gz)) {
          ctx.fillStyle = css(CLIFF_DARK);
          ctx.fillRect(x1 - lipH, y0, lipH, h + lift);
        }
        if (!this.isLand(gx - 1, gz)) {
          ctx.fillStyle = css(CLIFF_BODY);
          ctx.fillRect(x0, y0, lipH, h + lift);
        }
      }
    }

    // Collect hit rectangles for pointer picking this frame
    const hits: HitEntity[] = [];

    // PASS 3 — flat decorations (ponds, stone paths) sit on the plateau top
    this.decorations.forEach((d) => {
      if (!FLAT_DECOR.has(d.type)) return;
      const dragging = this.drag != null && this.drag.id === d.id;
      const gx = dragging ? this.drag!.gridX : d.x;
      const gz = dragging ? this.drag!.gridZ : d.z;
      const biome = getBiomeAt(gx, gz);
      const spr = this.getDecorSprite(d.type, biome);
      const lx = gx * 2 * TILE;
      const lz = gz * 2 * TILE;
      const w = Math.round(spr.width * zoom);
      const h = Math.round(spr.height * zoom);
      const x0 = Math.round(sx(lx) - w / 2);
      const y0 = Math.round(syL(lz) - h / 2);
      ctx.drawImage(spr, x0, y0, w, h);
      hits.push({ id: d.id, kind: 'decor', x0, y0, w, h, ax: lx, az: lz, biome: null });
    });

    // PASS 4 — standing entities (trees + standing decorations), y-sorted
    const standing: DrawEntity[] = [];
    this.trees.forEach((t, i) => {
      const dragging = this.drag != null && this.drag.id === t.id;
      const gx = dragging ? this.drag!.gridX : t.x;
      const gz = dragging ? this.drag!.gridZ : t.z;
      const biome = getBiomeAt(t.x, t.z); // foliage locked to the tree's own biome
      standing.push({
        id: t.id,
        kind: 'tree',
        lx: gx * 2 * TILE,
        lz: gz * 2 * TILE,
        spr: this.getTreeSprite(t, biome),
        sway: t.vitality > 0.05 && t.growth >= 0.18 && !dragging,
        flip: false,
        hop: 0,
        dragging,
        seed: hash2(i * 3.3, 7.7),
        biome,
        completed: t.growth >= 0.99 && t.vitality > 0.05
      });
    });
    this.decorations.forEach((d, i) => {
      if (FLAT_DECOR.has(d.type)) return;
      const dragging = this.drag != null && this.drag.id === d.id;
      let gx = d.x;
      let gz = d.z;
      let flip = false;
      let hop = 0;
      if (ANIMAL_TYPES.has(d.type)) {
        const st = this.animals.get(d.id);
        if (st && !dragging) {
          gx = st.x;
          gz = st.z;
          // Sprites are drawn facing left by default, so mirror when moving right
          flip = st.facing > 0;
          hop = st.hop;
        }
      }
      if (dragging) {
        gx = this.drag!.gridX;
        gz = this.drag!.gridZ;
      }
      standing.push({
        id: d.id,
        kind: 'decor',
        lx: gx * 2 * TILE,
        lz: gz * 2 * TILE,
        spr: this.getDecorSprite(d.type, getBiomeAt(gx, gz)),
        sway: false,
        flip,
        hop,
        dragging,
        seed: hash2(i * 5.1, 3.9),
        biome: null,
        completed: false
      });
    });
    standing.sort((a, b) => a.lz - b.lz);

    standing.forEach((e) => {
      const w = Math.round(e.spr.width * zoom);
      const h = Math.round(e.spr.height * zoom);
      const dragLift = e.dragging ? Math.round(6 * zoom) : 0;
      const ex = Math.round(sx(e.lx) - w / 2);
      const ey = Math.round(syL(e.lz) - h + 3 * zoom - e.hop * zoom - dragLift);

      // Contact shadow on the plateau top
      ctx.fillStyle = 'rgba(15,30,10,0.28)';
      ctx.beginPath();
      ctx.ellipse(sx(e.lx), syL(e.lz) + 2 * zoom, e.spr.width * 0.38 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      if (e.dragging) ctx.globalAlpha = 0.85;

      if (e.sway && e.spr.height > 12) {
        // Gentle canopy sway: top slice shifts, trunk stays put
        const sway = Math.round(Math.sin(this.time * 1.8 + e.seed * 6.28) * 1.2) * Math.max(1, Math.round(zoom * 0.5));
        const split = e.spr.height - 9;
        const splitCss = Math.round(split * zoom);
        ctx.drawImage(e.spr, 0, 0, e.spr.width, split, ex + sway, ey, w, splitCss);
        ctx.drawImage(e.spr, 0, split, e.spr.width, e.spr.height - split, ex, ey + splitCss, w, h - splitCss);
      } else if (e.flip) {
        ctx.save();
        ctx.translate(ex + w, ey);
        ctx.scale(-1, 1);
        ctx.drawImage(e.spr, 0, 0, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(e.spr, ex, ey, w, h);
      }

      ctx.globalAlpha = 1;

      // Trophy sparkle: completed books twinkle with a few golden stars so a
      // finished read reads like a permanent achievement on the canopy.
      if (e.completed && !e.dragging) {
        const cx = sx(e.lx);
        const top = ey;
        const stars: Array<[number, number, number]> = [
          [-0.32, 0.12, 0.0],
          [0.34, 0.2, 2.1],
          [0.05, -0.06, 4.0]
        ];
        stars.forEach(([fx, fy, phase]) => {
          const tw = (Math.sin(this.time * 3.2 + phase + e.seed * 6.28) + 1) * 0.5; // 0..1
          if (tw < 0.15) return;
          const px0 = cx + fx * w;
          const py0 = top + fy * h;
          const r = (1.0 + tw * 1.8) * zoom;
          ctx.fillStyle = `rgba(255,224,130,${0.35 + tw * 0.6})`;
          // 4-point star (two crossed bars)
          ctx.fillRect(px0 - r, py0 - zoom * 0.45, r * 2, zoom * 0.9);
          ctx.fillRect(px0 - zoom * 0.45, py0 - r, zoom * 0.9, r * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`;
          ctx.fillRect(px0 - zoom * 0.35, py0 - zoom * 0.35, zoom * 0.7, zoom * 0.7);
        });
      }

      hits.push({ id: e.id, kind: e.kind, x0: ex, y0: ey, w, h, ax: e.lx, az: e.lz, biome: e.biome });
    });

    this.lastEntities = hits;

    // PASS 5 — drop highlight while dragging an object
    if (this.drag && this.drag.moved) {
      const lx = this.drag.gridX * 2 * TILE;
      const lz = this.drag.gridZ * 2 * TILE;
      const tw = TILE * zoom;
      const cx = sx(lx);
      const cy = syL(lz);
      const ok = this.drag.valid;
      ctx.fillStyle = ok ? 'rgba(90,220,100,0.22)' : 'rgba(230,70,70,0.22)';
      ctx.fillRect(cx - tw / 2, cy - tw / 2, tw, tw);
      ctx.strokeStyle = ok ? 'rgba(120,240,130,0.95)' : 'rgba(240,90,90,0.95)';
      ctx.lineWidth = Math.max(1, zoom);
      ctx.strokeRect(cx - tw / 2, cy - tw / 2, tw, tw);
      if (!ok) {
        const label = this.drag.biome ? '여기엔 못 심어요' : '여기엔 못 놔요';
        ctx.font = `${Math.max(10, Math.round(4 * zoom))}px "DungGeunMo", monospace`;
        ctx.textAlign = 'center';
        const tx = cx;
        const ty = cy - tw / 2 - 6 * zoom;
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        const tWidth = ctx.measureText(label).width;
        ctx.fillRect(tx - tWidth / 2 - 4, ty - Math.round(4 * zoom), tWidth + 8, Math.round(6 * zoom));
        ctx.fillStyle = '#ffd24d';
        ctx.fillText(label, tx, ty);
        ctx.textAlign = 'left';
      }
    }

    // PASS 5.5 — manual placement ghost (semi-transparent decoration + tile cell)
    if (this.placementType) {
      const type = this.placementType;
      const gx = this.placeGridX;
      const gz = this.placeGridZ;
      const lx = gx * 2 * TILE;
      const lz = gz * 2 * TILE;
      const spr = this.getDecorSprite(type, getBiomeAt(gx, gz));
      const w = Math.round(spr.width * zoom);
      const h = Math.round(spr.height * zoom);
      const cx = sx(lx);
      const cy = syL(lz);
      const flat = FLAT_DECOR.has(type);
      const ex = Math.round(cx - w / 2);
      const ey = flat ? Math.round(cy - h / 2) : Math.round(cy - h + 3 * zoom);

      const tw = TILE * zoom;
      const ok = this.placeValid;
      ctx.fillStyle = ok ? 'rgba(90,220,100,0.22)' : 'rgba(230,70,70,0.22)';
      ctx.fillRect(cx - tw / 2, cy - tw / 2, tw, tw);
      ctx.strokeStyle = ok ? 'rgba(120,240,130,0.95)' : 'rgba(240,90,90,0.95)';
      ctx.lineWidth = Math.max(1, zoom);
      ctx.strokeRect(cx - tw / 2, cy - tw / 2, tw, tw);

      ctx.globalAlpha = 0.7;
      ctx.drawImage(spr, ex, ey, w, h);
      ctx.globalAlpha = 1;

      const label = ok ? '클릭해서 놓기' : '여기엔 못 놔요';
      ctx.font = `${Math.max(10, Math.round(4 * zoom))}px "DungGeunMo", monospace`;
      ctx.textAlign = 'center';
      const ty = cy - tw / 2 - 6 * zoom;
      const tWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(cx - tWidth / 2 - 4, ty - Math.round(4 * zoom), tWidth + 8, Math.round(6 * zoom));
      ctx.fillStyle = ok ? '#aef2b0' : '#ffb0b0';
      ctx.fillText(label, cx, ty);
      ctx.textAlign = 'left';
    }

    // PASS 6 — weather (screen-space rain / snow)
    if (this.weather !== 'clear') {
      const dt = 1 / 60;
      this.particles.forEach((p) => {
        const falling = this.weather === 'rainy' ? 1.0 : 0.28;
        p.y += p.speed * falling * dt;
        if (p.y > 1) {
          p.y -= 1;
          p.x = Math.random();
        }
        const pxs = p.x * cw + Math.sin(this.time * 1.5 + p.sway) * 14;
        const pys = p.y * chh;
        // Rain turns to snow over the winter quadrant
        const wx = (pxs - cw / 2) / zoom + this.camX;
        const wz = (pys - chh / 2) / zoom + this.camY;
        const isSnow = this.weather === 'snowy' || getBiomeAt(wx, wz) === 'winter';
        if (isSnow) {
          ctx.fillStyle = 'rgba(245,248,255,0.9)';
          ctx.fillRect(Math.round(pxs), Math.round(pys), 2, 2);
        } else {
          ctx.strokeStyle = 'rgba(140,170,230,0.65)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pxs, pys);
          ctx.lineTo(pxs - 2, pys + 9);
          ctx.stroke();
        }
      });
      ctx.fillStyle = 'rgba(30,40,70,0.16)';
      ctx.fillRect(0, 0, cw, chh);
    }

    // PASS 7 — night lighting with lantern glow
    if (this.ambient > 0.02) {
      const lctx = this.lctx;
      lctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      lctx.clearRect(0, 0, cw, chh);
      lctx.fillStyle = `rgba(14,16,52,${this.ambient})`;
      lctx.fillRect(0, 0, cw, chh);

      const lanterns = this.decorations.filter((d) => d.type === 'lantern');
      lctx.globalCompositeOperation = 'destination-out';
      lanterns.forEach((d) => {
        const lx = sx(d.x * 2 * TILE);
        const ly = syL(d.z * 2 * TILE) - 12 * zoom;
        const radius = (52 + Math.sin(this.time * 8) * 3) * zoom;
        const grad = lctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        lctx.fillStyle = grad;
        lctx.beginPath();
        lctx.arc(lx, ly, radius, 0, Math.PI * 2);
        lctx.fill();
      });
      lctx.globalCompositeOperation = 'source-over';

      ctx.drawImage(this.light, 0, 0, cw, chh);

      ctx.globalCompositeOperation = 'lighter';
      lanterns.forEach((d) => {
        const lx = sx(d.x * 2 * TILE);
        const ly = syL(d.z * 2 * TILE) - 12 * zoom;
        const radius = 26 * zoom;
        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
        grad.addColorStop(0, `rgba(255,176,64,${0.3 * (this.ambient / 0.62)})`);
        grad.addColorStop(1, 'rgba(255,176,64,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}
