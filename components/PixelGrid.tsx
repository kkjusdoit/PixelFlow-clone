import React, { useState, useEffect } from 'react';
import { Pixel, ColorMap } from '../types';

interface PixelGridProps {
  grid: Pixel[][];
  isEditing?: boolean;
  onInteract?: (r: number, c: number) => void;
}

export const PixelGrid: React.FC<PixelGridProps> = ({ grid, isEditing = false, onInteract }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Global mouse up listener to stop painting if mouse is released outside grid
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseDown = (r: number, c: number) => {
    if (!isEditing || !onInteract) return;
    setIsMouseDown(true);
    onInteract(r, c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isEditing || !onInteract || !isMouseDown) return;
    onInteract(r, c);
  };

  return (
    <div 
        className={`relative bg-slate-800/50 rounded-lg p-2 shadow-inner border border-slate-700 ${isEditing ? 'cursor-crosshair' : ''}`}
        onMouseLeave={() => setIsMouseDown(false)}
    >
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
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
              className={`
                w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-sm transition-all duration-300
                ${pixel.active ? ColorMap[pixel.color] : (isEditing ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-900/50 opacity-20')}
                ${pixel.active ? 'scale-100' : 'scale-90'}
                ${isEditing ? 'hover:brightness-110 active:scale-95' : ''}
              `}
            />
          ))
        ))}
      </div>
    </div>
  );
};