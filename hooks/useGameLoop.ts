import { useState, useEffect, useRef, useCallback } from 'react';
import { Pixel, Shooter, GameState, GRID_SIZE, RAIL_SPEED, ColorID } from '../types';
import { generateLevel, findTargetPixel, calculateRailState, getSolution } from '../utils/gridHelpers';

export const useGameLoop = () => {
  const [grid, setGrid] = useState<Pixel[][]>([]);
  const [shooters, setShooters] = useState<Shooter[]>([]);
  // Inventory is now 4 lanes (columns) of shooters
  const [inventoryLanes, setInventoryLanes] = useState<Shooter[][]>([], [], [], []);
  const [gameState, setGameState] = useState<GameState>(GameState.Playing);
  const [score, setScore] = useState(0);
  
  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>();
  
  const stateRef = useRef({
      grid: [] as Pixel[][],
      shooters: [] as Shooter[],
      inventoryLanes: [] as Shooter[][], // Ref copy for game loop access
      score: 0,
      perimeter: GRID_SIZE * 4
  });

  // Helper to init a blank grid
  const createBlankGrid = () => {
      const g: Pixel[][] = [];
      for(let r=0; r<GRID_SIZE; r++){
          const row: Pixel[] = [];
          for(let c=0; c<GRID_SIZE; c++){
              row.push({
                  id: `p-${r}-${c}`,
                  color: ColorID.None,
                  active: false,
                  row: r,
                  col: c
              });
          }
          g.push(row);
      }
      return g;
  };

  // Logic to start/restart a level
  const startNewLevel = useCallback(() => {
    const initialGrid = generateLevel();
    setGrid(initialGrid);

    // Run the Simulation Peeling algorithm to get the perfect sequence
    const solution = getSolution(initialGrid);
    
    // Distribute solution into 4 lanes (Round Robin)
    const lanes: Shooter[][] = [[], [], [], []];
    solution.forEach((shooter, index) => {
        lanes[index % 4].push(shooter);
    });

    setInventoryLanes(lanes);
    setShooters([]);
    setScore(0);
    setGameState(GameState.Playing);

    // Synchronize Ref immediately to prevent loop race conditions
    stateRef.current.grid = initialGrid;
    stateRef.current.inventoryLanes = lanes;
    stateRef.current.shooters = [];
    stateRef.current.score = 0;
  }, []);

  // Initialize Level on Mount
  useEffect(() => {
    startNewLevel();
  }, [startNewLevel]);

  // Sync ref with state (for updates that happen outside startNewLevel)
  useEffect(() => {
      stateRef.current.grid = grid;
      stateRef.current.inventoryLanes = inventoryLanes;
  }, [grid, inventoryLanes]);

  const gameTick = useCallback((time: number) => {
      if (lastTimeRef.current === 0) {
          lastTimeRef.current = time;
          requestRef.current = requestAnimationFrame(gameTick);
          return;
      }

      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Only run physics if Playing
      if (gameState === GameState.Playing) {
          const state = stateRef.current;
          
          // 1. Move Shooters & Fire
          const survivingShooters: Shooter[] = [];
          let gridModified = false;

          state.shooters.forEach(shooter => {
               const oldPos = shooter.railPosition;
               const moveDist = RAIL_SPEED * dt;
               
               // Calculate logical crossing of cell centers
               // Cell Center K is at position K + 0.5
               // We check if we crossed any (K + 0.5) boundary in this step.
               // We use floor(pos - 0.5) to identify which cell "center region" we are in.
               // If it changes, we crossed a center.
               
               const idxStart = Math.floor(oldPos - 0.5);
               const idxEnd = Math.floor((oldPos + moveDist) - 0.5);
               
               shooter.railPosition = (oldPos + moveDist) % state.perimeter;

               // Iterate through all centers crossed (usually just 1, unless lag spike)
               // Note: We use idxStart + 1 to idxEnd because we want the NEW region entered
               for (let i = idxStart + 1; i <= idxEnd; i++) {
                   if (shooter.ammo <= 0) break;

                   // We need the effective grid coordinate logic.
                   // The "Center" of cell index C is at C + 0.5
                   // Logic index i corresponds to crossing the center of cell i.
                   // We need to handle wrapping for the logical check if the number implies it,
                   // but here calculateRailState handles the modulo internally.
                   // We just pass the center position (i + 0.5) to get the correct side/index.
                   
                   // Center position of the cell we just crossed
                   const checkPos = i + 0.5;
                   const { side, gridIndex } = calculateRailState(checkPos, state.perimeter, GRID_SIZE, GRID_SIZE);
                   const target = findTargetPixel(state.grid, side, gridIndex);

                   if (target && target.color === shooter.color) {
                       state.grid[target.row][target.col].active = false;
                       shooter.ammo--;
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
          setShooters([...state.shooters]); 
          if (gridModified) {
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

  // Spawn from a specific lane
  const handleSpawn = (laneIndex: number) => {
      // Limit to max 4 active shooters on the rail
      if (stateRef.current.shooters.length >= 4) {
          return;
      }

      const lane = stateRef.current.inventoryLanes[laneIndex];
      if (lane && lane.length > 0) {
          const s = lane[0];
          const newLane = lane.slice(1);
          stateRef.current.inventoryLanes[laneIndex] = newLane;
          
          stateRef.current.shooters.push({ 
              ...s, 
              state: 'moving', 
              // Start at Bottom-Left corner.
              // Top: 0->W, Right: W->2W, Bottom: 2W->3W, Left: 3W->4W
              // 3 * GRID_SIZE is the start of the Left side (Bottom-Left corner)
              railPosition: GRID_SIZE * 3 
          });

          setInventoryLanes([...stateRef.current.inventoryLanes]);
      }
  };

  // --- EDITOR FUNCTIONS ---

  const enterEditor = () => {
      setGameState(GameState.Editing);
      setShooters([]);
      setInventoryLanes([[],[],[],[]]);
      setScore(0);
      // We keep the current grid so the user can edit it
  };

  const clearGrid = () => {
      const newGrid = createBlankGrid();
      setGrid(newGrid);
  };

  const updatePixel = (r: number, c: number, color: ColorID, brushSize: number) => {
      const newGrid = grid.map(row => row.map(pixel => ({ ...pixel })));
      
      // Apply brush size (simple square for now)
      // If size is 1, just current pixel. If 2, 2x2.
      for (let i = 0; i < brushSize; i++) {
          for (let j = 0; j < brushSize; j++) {
              const tr = r + i;
              const tc = c + j;
              if (tr >= 0 && tr < GRID_SIZE && tc >= 0 && tc < GRID_SIZE) {
                  const isActive = color !== ColorID.None;
                  newGrid[tr][tc] = {
                      ...newGrid[tr][tc],
                      color: color,
                      active: isActive
                  };
              }
          }
      }
      
      setGrid(newGrid);
  };

  const playCustomLevel = () => {
      const currentGrid = stateRef.current.grid; // Use ref for latest
      
      // 1. Generate solution for the edited grid
      const solution = getSolution(currentGrid);
      
      // 2. Distribute to lanes
      const lanes: Shooter[][] = [[], [], [], []];
      solution.forEach((shooter, index) => {
          lanes[index % 4].push(shooter);
      });

      setInventoryLanes(lanes);
      setShooters([]);
      setGameState(GameState.Playing);
      lastTimeRef.current = 0;
  };

  return {
    grid,
    shooters,
    inventoryLanes,
    score,
    gameState,
    spawnShooter: handleSpawn,
    setGameState,
    enterEditor,
    updatePixel,
    clearGrid,
    playCustomLevel,
    restartLevel: startNewLevel
  };
};