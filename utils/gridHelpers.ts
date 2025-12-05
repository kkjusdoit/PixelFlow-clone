import { ColorID, GRID_SIZE, Pixel, Shooter } from '../types';

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
    for (let r = 0; r <= center + 1; r++) { 
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
 */
export const calculateRailState = (
  progress: number, 
  totalPerimeter: number, 
  width: number, 
  height: number
) => {
  const p = progress % totalPerimeter;
  
  let x = 0;
  let y = 0;
  let side: 'top' | 'right' | 'bottom' | 'left' = 'top';
  let gridIndex = 0; 

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

/**
 * Helper to deep clone the grid for simulation
 */
const cloneGrid = (grid: Pixel[][]): Pixel[][] => {
    return grid.map(row => row.map(p => ({ ...p })));
};

/**
 * SIMULATION PEELING ALGORITHM
 * Calculates the exact sequence of pigs needed to clear the level by simulating
 * a perfect game where the outer layers are peeled off one by one.
 */
export const getSolution = (grid: Pixel[][]): Shooter[] => {
    const simGrid = cloneGrid(grid);
    const solution: Shooter[] = [];
    let loopGuard = 0;
    let pigIdCounter = 0;

    // We loop until no active pixels remain or safety break
    while (loopGuard < 200) {
        loopGuard++;
        
        // 1. Scan Perimeter
        // We act as if shooters are everywhere on the rail.
        // We scan all 4 sides to find "First Visible" pixels.
        
        const exposedPixels: Pixel[] = [];
        
        // Scan Top (Cols 0 to Size-1)
        for(let c=0; c<GRID_SIZE; c++) {
            const p = findTargetPixel(simGrid, 'top', c);
            if(p) exposedPixels.push(p);
        }
        // Scan Right (Rows 0 to Size-1)
        for(let r=0; r<GRID_SIZE; r++) {
            const p = findTargetPixel(simGrid, 'right', r);
            if(p) exposedPixels.push(p);
        }
        // Scan Bottom (Cols 0 to Size-1)
        for(let c=0; c<GRID_SIZE; c++) {
            const p = findTargetPixel(simGrid, 'bottom', c);
            if(p) exposedPixels.push(p);
        }
        // Scan Left (Rows 0 to Size-1)
        for(let r=0; r<GRID_SIZE; r++) {
            const p = findTargetPixel(simGrid, 'left', r);
            if(p) exposedPixels.push(p);
        }

        // Check completion
        const hasActive = simGrid.some(row => row.some(p => p.active));
        if (exposedPixels.length === 0) {
            if (hasActive) {
                // Technically impossible in a convex-ish shape, but break to avoid freeze
                console.warn("Algorithm stuck: Active pixels exist but none exposed.");
                break;
            } else {
                // Victory Condition met in simulation
                break;
            }
        }

        // 2. Decision Strategy (Option A)
        // Count colors of the currently exposed layer
        // We use a Map to ensure unique pixels (a corner pixel might be seen from top and right)
        const uniqueExposed = new Map<string, Pixel>();
        exposedPixels.forEach(p => uniqueExposed.set(p.id, p));

        const colorCounts: Record<string, number> = {};
        uniqueExposed.forEach(p => {
            colorCounts[p.color] = (colorCounts[p.color] || 0) + 1;
        });

        // 3. Select Max Color
        let bestColor = ColorID.None;
        let maxCount = -1;

        for (const [color, count] of Object.entries(colorCounts)) {
             if (count > maxCount) {
                 maxCount = count;
                 bestColor = color as ColorID;
             }
        }

        if (bestColor === ColorID.None) break;

        // 4. Generate Pig
        // No ammo redundancy as requested.
        solution.push({
            id: `pig-${pigIdCounter++}`,
            color: bestColor,
            ammo: maxCount,
            maxAmmo: maxCount,
            railPosition: 0,
            state: 'inventory'
        });

        // 5. Simulate Elimination
        // Only remove the exposed pixels of the CHOSEN color.
        // This reveals the layer behind them for the next loop.
        uniqueExposed.forEach(p => {
            if (p.color === bestColor) {
                simGrid[p.row][p.col].active = false;
            }
        });
    }

    return solution;
};