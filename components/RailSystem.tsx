
import React from 'react';
import { Shooter, GRID_SIZE, ColorID } from '../types';
import { calculateRailState } from '../utils/gridHelpers';
import { Zap } from 'lucide-react';

interface RailSystemProps {
  shooters: Shooter[];
  children: React.ReactNode;
}

const PigRenderer: React.FC<{ shooter: Shooter; x: number; y: number; side: string }> = ({ shooter, x, y, side }) => {
  // Convert grid coordinates (0 to GRID_SIZE) to percentages
  const leftPct = (x / GRID_SIZE) * 100;
  const topPct = (y / GRID_SIZE) * 100;

  // Determine rotation and offset based on side
  // We want the pig to face the center
  let rotation = 0;
  let translate = 'translate(0, 0)';

  // We offset the pig "outwards" from the grid edge
  const offset = '35px';

  switch (side) {
    case 'top':
      rotation = 180;
      translate = `translate(-50%, -${offset})`;
      break;
    case 'right':
      rotation = -90;
      translate = `translate(${offset}, -50%)`;
      break;
    case 'bottom':
      rotation = 0;
      translate = `translate(-50%, ${offset})`;
      break;
    case 'left':
      rotation = 90;
      translate = `translate(-${offset}, -50%)`;
      break;
  }

  const bgColor = {
    [ColorID.Red]: 'bg-red-500',
    [ColorID.Green]: 'bg-green-500',
    [ColorID.Blue]: 'bg-blue-500',
    [ColorID.Yellow]: 'bg-yellow-400',
    [ColorID.White]: 'bg-slate-100',
    [ColorID.Purple]: 'bg-purple-500',
    [ColorID.Orange]: 'bg-orange-500',
    [ColorID.None]: 'bg-gray-500',
  }[shooter.color];

  return (
    <div
      className="absolute z-20"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: translate,
      }}
    >
      <div 
        className={`relative w-8 h-8 md:w-10 md:h-10 ${bgColor} rounded-xl shadow-lg border-2 border-slate-900 flex items-center justify-center`}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Face */}
        <div className="flex gap-1 mb-1">
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
            <div className="w-1.5 h-1.5 bg-black rounded-full" />
        </div>
        
        {/* Snout */}
        <div className="absolute bottom-1 w-5 h-3 bg-black/20 rounded-full" />

        {/* Ammo Indicator */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 rounded-full border border-slate-600">
          {shooter.ammo}
        </div>
      </div>
    </div>
  );
};

export const RailSystem: React.FC<RailSystemProps> = ({ shooters, children }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square flex items-center justify-center p-12 md:p-16">
      
      {/* The Physical Rail Track (Visual Background) */}
      <div className="absolute inset-4 md:inset-6 rounded-3xl border-[20px] md:border-[24px] border-slate-800 bg-slate-900/50 shadow-2xl">
         {/* Track Groove */}
         <div className="absolute inset-[-8px] border-2 border-slate-700/50 rounded-[28px] pointer-events-none" />
         <div className="absolute inset-[8px] border-2 border-slate-700/50 rounded-[16px] pointer-events-none" />
         
         {/* Corner Screws */}
         <div className="absolute -top-3 -left-3 w-4 h-4 rounded-full bg-slate-600 shadow-inner" />
         <div className="absolute -top-3 -right-3 w-4 h-4 rounded-full bg-slate-600 shadow-inner" />
         <div className="absolute -bottom-3 -left-3 w-4 h-4 rounded-full bg-slate-600 shadow-inner" />
         <div className="absolute -bottom-3 -right-3 w-4 h-4 rounded-full bg-slate-600 shadow-inner" />
      </div>

      {/* Container for Grid and Shooters */}
      {/* This container defines the coordinate space (0,0 is top-left of grid area) */}
      <div className="relative w-full h-full">
        
        {/* The Grid */}
        <div className="w-full h-full relative z-10">
          {children}
        </div>

        {/* The Shooters Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {shooters.map(shooter => {
             const perimeter = GRID_SIZE * 4;
             const { side, x, y } = calculateRailState(shooter.railPosition, perimeter, GRID_SIZE, GRID_SIZE);
             
             return (
               <PigRenderer 
                 key={shooter.id} 
                 shooter={shooter} 
                 x={x} 
                 y={y} 
                 side={side} 
               />
             );
          })}
        </div>
      </div>
    </div>
  );
};
