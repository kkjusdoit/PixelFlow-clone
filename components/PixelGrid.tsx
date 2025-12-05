
import React from 'react';
import { Pixel, ColorMap } from '../types';

interface PixelGridProps {
  grid: Pixel[][];
}

export const PixelGrid: React.FC<PixelGridProps> = ({ grid }) => {
  return (
    <div className="relative bg-slate-800/50 rounded-lg p-2 shadow-inner border border-slate-700">
      <div 
        className="grid gap-1"
        style={{ 
            gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` 
        }}
      >
        {grid.map((row, r) => (
          row.map((pixel, c) => (
            <div
              key={pixel.id}
              className={`
                w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-sm transition-all duration-300
                ${pixel.active ? ColorMap[pixel.color] : 'bg-slate-900/50 opacity-20'}
                ${pixel.active ? 'scale-100' : 'scale-90'}
              `}
            />
          ))
        ))}
      </div>
    </div>
  );
};
