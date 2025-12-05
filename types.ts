// Enum for Pixel and Pig colors
export enum ColorID {
  None = 'NONE',
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
  Yellow = 'YELLOW',
  White = 'WHITE',
  Purple = 'PURPLE',
  Orange = 'ORANGE'
}

// Visual configuration for colors
export const ColorMap: Record<ColorID, string> = {
  [ColorID.None]: 'bg-transparent',
  [ColorID.Red]: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]',
  [ColorID.Green]: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]',
  [ColorID.Blue]: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]',
  [ColorID.Yellow]: 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]',
  [ColorID.White]: 'bg-slate-100 shadow-[0_0_10px_rgba(241,245,249,0.6)]',
  [ColorID.Purple]: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]',
  [ColorID.Orange]: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
};

// Represents a single cell in the grid
export interface Pixel {
  id: string;
  color: ColorID;
  active: boolean;
  row: number;
  col: number;
}

// Represents the "Pig" (Shooter)
export interface Shooter {
  id: string;
  color: ColorID;
  ammo: number;
  maxAmmo: number;
  // Position on the rail (0 to perimeter length)
  railPosition: number; 
  state: 'inventory' | 'moving' | 'returning';
  lastFired: number; // Timestamp of last shot to limit fire rate
}

// Game Status
export enum GameState {
  Playing = 'PLAYING',
  Won = 'WON',
  Lost = 'LOST',
}

export interface LevelConfig {
  gridSize: number; // e.g. 11 for 11x11
  pixels: Pixel[][];
}

export const GRID_SIZE = 11;
export const RAIL_PADDING = 2; // Distance from grid to rail
export const MAX_TRAYS = 5;
export const RAIL_SPEED = 6.0; // Grid cells per second (Adjusted for smooth gameplay)
export const FIRE_RATE = 0.15; // Seconds between shots