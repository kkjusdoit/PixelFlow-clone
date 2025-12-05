
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pixel, Shooter, ColorID, GameState, GRID_SIZE, RAIL_SPEED, FIRE_RATE } from '../types';
import { generateLevel, findTargetPixel, calculateRailState } from '../utils/gridHelpers';

export const useGameLoop = () => {
  const [grid, setGrid] = useState<Pixel[][]>([]);
  const [shooters, setShooters] = useState<Shooter[]>([]);
  const [inventory, setInventory] = useState<Shooter[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [score, setScore] = useState(0);
  
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();
  
  // Initialize Level
  useEffect(() => {
    const initialGrid = generateLevel();
    setGrid(initialGrid);

    // Initial Inventory
    // Fixed: Colors now match the colors generated in the grid (Red, Green, Yellow, Orange, Purple, White)
    const validColors = [ColorID.Red, ColorID.Green, ColorID.Yellow, ColorID.Orange, ColorID.Purple, ColorID.White];
    
    const initialInventory: Shooter[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `inv-${i}`,
      color: validColors[Math.floor(Math.random() * validColors.length)],
      ammo: 15,
      maxAmmo: 15,
      railPosition: 0,
      state: 'inventory',
      lastFired: 0
    }));
    setInventory(initialInventory);
  }, []);

  const spawnShooter = useCallback((shooterId: string) => {
    // We handle this via the ref in gameTick for synchronization, but we trigger the state change here
    // effectively by updating the ref and forcing a re-render is handled by the loop.
    // However, to be safe with React event handling:
  }, []);

  // We need a specific "Tick" function that has access to both Grid and Shooters
  // We'll use a `useRef` to hold the game state and a `useState` to force renders.
  
  const stateRef = useRef({
      grid: [] as Pixel[][],
      shooters: [] as Shooter[],
      inventory: [] as Shooter[],
      score: 0,
      perimeter: GRID_SIZE * 4
  });

  // Sync ref with initial state
  useEffect(() => {
      if (grid.length > 0 && stateRef.current.grid.length === 0) {
          stateRef.current.grid = grid;
          stateRef.current.inventory = inventory;
      }
  }, [grid, inventory]);

  const gameTick = useCallback((time: number) => {
      // Initialize lastTimeRef correctly on first frame
      if (lastTimeRef.current === 0) {
          lastTimeRef.current = time;
          requestRef.current = requestAnimationFrame(gameTick);
          return;
      }

      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (gameState === GameState.Playing) {
          const state = stateRef.current;
          
          // 1. Move Shooters & Fire
          const survivingShooters: Shooter[] = [];
          let gridModified = false;

          state.shooters.forEach(shooter => {
               // Move
               // Fixed: Removed arbitrary multipliers. Now uses RAIL_SPEED (cells/sec) * dt (seconds)
               shooter.railPosition += RAIL_SPEED * dt; 
               
               // Check loop
               if (shooter.railPosition >= state.perimeter) {
                   shooter.railPosition = shooter.railPosition % state.perimeter;
               }

               // Fire
               const canFire = (time / 1000) - shooter.lastFired > FIRE_RATE;
               
               if (shooter.ammo > 0 && canFire) {
                   const { side, gridIndex } = calculateRailState(shooter.railPosition, state.perimeter, GRID_SIZE, GRID_SIZE);
                   const target = findTargetPixel(state.grid, side, gridIndex);

                   if (target && target.color === shooter.color) {
                       // HIT!
                       state.grid[target.row][target.col].active = false;
                       shooter.ammo--;
                       shooter.lastFired = time / 1000;
                       state.score += 10;
                       gridModified = true;
                   }
               }

               if (shooter.ammo > 0) {
                   survivingShooters.push(shooter);
               }
          });

          state.shooters = survivingShooters;
          
          // Check Win
          const hasPixels = state.grid.some(row => row.some(p => p.active));
          if (!hasPixels && state.grid.length > 0) {
              setGameState(GameState.Won);
          }

          // Force Render
          // Optimization: Only update React state if needed or every frame for smooth movement
          setShooters([...state.shooters]); 
          if (gridModified) {
              // Create a shallow copy of the grid rows to trigger React re-render
              setGrid([...state.grid.map(row => [...row])]);
              setScore(state.score);
          }
      }
      
      requestRef.current = requestAnimationFrame(gameTick);
  }, [gameState]);


  useEffect(() => {
     requestRef.current = requestAnimationFrame(gameTick);
     return () => {
         if (requestRef.current) cancelAnimationFrame(requestRef.current);
     }
  }, [gameTick]);

  const handleSpawn = (id: string) => {
      const s = stateRef.current.inventory.find(x => x.id === id);
      if (s) {
          stateRef.current.inventory = stateRef.current.inventory.filter(x => x.id !== id);
          // Reset shooter state when spawning
          stateRef.current.shooters.push({ 
              ...s, 
              state: 'moving', 
              railPosition: 0,
              lastFired: 0 
          });
          setInventory([...stateRef.current.inventory]);
      }
  };

  return {
    grid,
    shooters,
    inventory,
    score,
    gameState,
    spawnShooter: handleSpawn,
    setGameState
  };
};
