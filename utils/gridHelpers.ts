import { ColorID, GRID_SIZE, Pixel } from '../types';

/**
 * Generates a pixel art level pattern (e.g., a potion bottle shape)
 */
export const generateLevel = (): Pixel[][] => {
  const grid: Pixel[][] = [];
  const center = Math.floor(GRID_SIZE / 2);

  for (let r = 0; r < GRID_SIZE; r++) {
    const row: Pixel[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let color = ColorID.None;
      let active = false;

      // Simple procedural shape: A bottle/flask shape
      const dx = Math.abs(c - center);
      const dy = Math.abs(r - center);
      const dist = Math.sqrt(dx*dx + dy*dy);

      // Core logic to determine active pixels
      if (r > center && dx <= 2) {
         // Bottom part of flask
         color = Math.random() > 0.5 ? ColorID.Red : ColorID.Orange;
         active = true;
      } else if (r <= center && r > center - 3 && dx <= 1) {
         // Neck of flask
         color = ColorID.Green;
         active = true;
      } else if (r === center - 3 && dx <= 2) {
         // Rim
         color = ColorID.White;
         active = true;
      } else if (dist < 4 && r > 2) {
         // Fill gaps
         if (!active) {
            color = ColorID.Yellow;
            active = true;
         }
      }

      // Border noise for testing
      if (!active && dx < 4 && dy < 4 && Math.random() > 0.8) {
          color = ColorID.Purple;
          active = true;
      }

      row.push({
        id: `p-${r}-${c}`,
        color,
        active,
        row: r,
        col: c
      });
    }
    grid.push(row);
  }
  return grid;
};

/**
 * Raycast Logic: Finds the first active pixel from a specific angle
 * This replaces physics raycasts.
 */
export const findTargetPixel = (
  grid: Pixel[][], 
  side: 'top' | 'right' | 'bottom' | 'left', 
  index: number
): Pixel | null => {
  // Guard against out of bounds indices
  if (index < 0 || index >= GRID_SIZE) return null;

  const center = Math.floor(GRID_SIZE / 2);

  if (side === 'top') {
    // Scan from Row 0 downwards
    for (let r = 0; r <= center + 1; r++) { // +1 to allow hitting slightly past center if needed
      const pixel = grid[r][index];
      if (pixel.active) return pixel;
    }
  } else if (side === 'bottom') {
    // Scan from Row MAX upwards
    for (let r = GRID_SIZE - 1; r >= center - 1; r--) {
      const pixel = grid[r][index];
      if (pixel.active) return pixel;
    }
  } else if (side === 'left') {
    // Scan from Col 0 rightwards
    for (let c = 0; c <= center + 1; c++) {
      const pixel = grid[index][c];
      if (pixel.active) return pixel;
    }
  } else if (side === 'right') {
    // Scan from Col MAX leftwards
    for (let c = GRID_SIZE - 1; c >= center - 1; c--) {
      const pixel = grid[index][c];
      if (pixel.active) return pixel;
    }
  }

  return null;
};

/**
 * Converts linear rail progress (0-totalPerimeter) to 2D coordinates and Grid facing info.
 * The Rail is a rectangle around the grid.
 */
export const calculateRailState = (
  progress: number, 
  totalPerimeter: number, 
  width: number, 
  height: number
) => {
  // Normalize progress
  const p = progress % totalPerimeter;
  
  // Dimensions of the rail path
  // Top: 0 -> width
  // Right: width -> width + height
  // Bottom: width + height -> 2*width + height
  // Left: 2*width + height -> 2*width + 2*height

  let x = 0;
  let y = 0;
  let side: 'top' | 'right' | 'bottom' | 'left' = 'top';
  let gridIndex = 0; // Which row or column does this align with?

  if (p < width) {
    // TOP SIDE
    x = p;
    y = 0;
    side = 'top';
    gridIndex = Math.floor(x);
  } else if (p < width + height) {
    // RIGHT SIDE
    x = width;
    y = p - width;
    side = 'right';
    gridIndex = Math.floor(y);
  } else if (p < 2 * width + height) {
    // BOTTOM SIDE
    x = width - (p - (width + height));
    y = height;
    side = 'bottom';
    gridIndex = Math.floor(x);
  } else {
    // LEFT SIDE
    x = 0;
    y = height - (p - (2 * width + height));
    side = 'left';
    gridIndex = Math.floor(y);
  }

  return { x, y, side, gridIndex };
};
