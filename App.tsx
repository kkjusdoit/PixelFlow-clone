import React, { useState } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { PixelGrid } from './components/PixelGrid';
import { RailSystem } from './components/RailSystem';
import { ColorID, GameState, Shooter, ColorMap } from './types';
import { Trophy, RefreshCcw, Skull, PackagePlus, Edit3, Play, Trash2, Eraser, Square } from 'lucide-react';

const App: React.FC = () => {
  const { 
    grid, 
    shooters, 
    inventoryLanes, 
    score, 
    gameState, 
    spawnShooter,
    enterEditor,
    updatePixel,
    clearGrid,
    playCustomLevel,
    restartLevel
  } = useGameLoop();

  // Editor State
  const [brushColor, setBrushColor] = useState<ColorID>(ColorID.Red);
  const [brushSize, setBrushSize] = useState<number>(1);

  const handleRestart = () => {
    restartLevel(); 
  };

  const handleEditorInteraction = (r: number, c: number) => {
    if (gameState === GameState.Editing) {
      updatePixel(r, c, brushColor, brushSize);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between py-4 px-2 md:py-8 font-sans select-none">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-colors ${gameState === GameState.Editing ? 'bg-orange-500 shadow-orange-500/20' : 'bg-blue-500 shadow-blue-500/20'}`}>
            {gameState === GameState.Editing ? <Edit3 className="text-white w-6 h-6" /> : (
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-2 h-2 bg-white rounded-xs"></div>
                <div className="w-2 h-2 bg-white/50 rounded-xs"></div>
                <div className="w-2 h-2 bg-white/50 rounded-xs"></div>
                <div className="w-2 h-2 bg-white rounded-xs"></div>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pixel Flow
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              {gameState === GameState.Editing ? 'MAP EDITOR' : 'SIMULATION MODE'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            {gameState === GameState.Playing && (
              <button 
                onClick={enterEditor}
                className="text-xs flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Edit Level
              </button>
            )}
            
            <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">{score.toString().padStart(5, '0')}</p>
            </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <RailSystem shooters={shooters}>
          <PixelGrid 
            grid={grid} 
            isEditing={gameState === GameState.Editing}
            onInteract={handleEditorInteraction}
          />
        </RailSystem>
        
        {/* Game Over / Victory Overlay */}
        {(gameState === GameState.Won || gameState === GameState.Lost) && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border-2 border-slate-700 text-center max-w-sm w-full mx-4 transform scale-100">
              {gameState === GameState.Won ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(234,179,8,0.5)] animate-bounce">
                    <Trophy className="w-10 h-10 text-slate-900" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Stage Clear!</h2>
                  <p className="text-slate-400 mb-6">All pixels have been neutralized.</p>
                  <p className="text-xl font-mono text-yellow-400 mb-8">Score: {score}</p>
                  <div className="grid gap-3 w-full">
                    <button 
                      onClick={handleRestart}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full justify-center"
                    >
                      <RefreshCcw className="w-5 h-5" /> Next Level
                    </button>
                    <button 
                      onClick={enterEditor}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full justify-center"
                    >
                      <Edit3 className="w-5 h-5" /> Edit Map
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                    <Skull className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">System Failure</h2>
                  <p className="text-slate-400 mb-6">Inventory depleted.</p>
                  <div className="grid gap-3 w-full">
                    <button 
                      onClick={handleRestart}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full justify-center"
                    >
                      <RefreshCcw className="w-5 h-5" /> Retry
                    </button>
                    <button 
                      onClick={enterEditor}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full justify-center"
                    >
                      <Edit3 className="w-5 h-5" /> Fix in Editor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel: Swaps between Inventory (Playing) and Editor Tools (Editing) */}
      <div className="w-full max-w-2xl mt-4">
        {gameState === GameState.Editing ? (
          /* EDITOR TOOLS */
          <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-4 border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Color Palette */}
              <div className="flex flex-wrap gap-2 justify-center bg-slate-900/50 p-2 rounded-xl">
                {Object.values(ColorID).filter(c => c !== ColorID.None).map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${ColorMap[color]} ${brushColor === color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent opacity-80'}`}
                  />
                ))}
                {/* Eraser */}
                <div className="w-px h-8 bg-slate-700 mx-1"></div>
                <button
                    onClick={() => setBrushColor(ColorID.None)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${brushColor === ColorID.None ? 'bg-slate-600 border-white text-white' : 'bg-slate-700 border-transparent text-slate-400 hover:text-white'}`}
                    title="Eraser"
                  >
                    <Eraser className="w-4 h-4" />
                </button>
              </div>

              {/* Tools & Actions */}
              <div className="flex gap-4 items-center">
                 {/* Brush Size */}
                 <div className="flex bg-slate-900/50 rounded-lg p-1">
                    {[1, 2, 3].map(size => (
                      <button
                        key={size}
                        onClick={() => setBrushSize(size)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${brushSize === size ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                        title={`Brush Size ${size}`}
                      >
                         <div className="bg-current rounded-sm" style={{ width: size*4, height: size*4 }} />
                      </button>
                    ))}
                 </div>

                 <div className="w-px h-8 bg-slate-700"></div>

                 {/* Actions */}
                 <button 
                    onClick={clearGrid}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Clear All"
                 >
                    <Trash2 className="w-5 h-5" />
                 </button>

                 <button
                    onClick={playCustomLevel}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-green-500/20 transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" /> PLAY
                 </button>
              </div>
            </div>
          </div>
        ) : (
          /* PLAYING INVENTORY */
          <div className="bg-slate-800/80 backdrop-blur rounded-t-2xl p-4 border-t border-x border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <PackagePlus className="w-4 h-4" /> REINFORCEMENTS
              </h3>
              <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
                Queue System Active
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {inventoryLanes.map((lane, laneIndex) => {
                  const visibleItems = lane.slice(0, 3);
                  const isEmpty = lane.length === 0;

                  return (
                      <div key={`lane-${laneIndex}`} className="flex flex-col gap-2 relative">
                          {isEmpty && (
                              <div className="h-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-xs text-slate-600">
                                  Empty
                              </div>
                          )}

                          {visibleItems.map((pig, index) => {
                              const isTop = index === 0;
                              return (
                                  <InventoryItem 
                                      key={pig.id} 
                                      pig={pig} 
                                      onClick={() => isTop ? spawnShooter(laneIndex) : null}
                                      isTop={isTop}
                                      index={index}
                                  />
                              );
                          })}
                          
                          {lane.length > 3 && (
                              <div className="text-center text-[10px] text-slate-500">
                                  +{lane.length - 3} more
                              </div>
                          )}
                      </div>
                  );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for Inventory Item
const InventoryItem: React.FC<{ 
    pig: Shooter; 
    onClick: () => void; 
    isTop: boolean;
    index: number;
}> = ({ pig, onClick, isTop, index }) => {
    const colorClasses = {
      [ColorID.Red]: 'bg-red-500 border-red-700',
      [ColorID.Green]: 'bg-green-500 border-green-700',
      [ColorID.Blue]: 'bg-blue-500 border-blue-700',
      [ColorID.Yellow]: 'bg-yellow-400 border-yellow-600',
      [ColorID.White]: 'bg-slate-100 border-slate-300',
      [ColorID.Purple]: 'bg-purple-500 border-purple-700',
      [ColorID.Orange]: 'bg-orange-500 border-orange-700',
      [ColorID.None]: 'bg-gray-500 border-gray-700',
    }[pig.color];
  
    const opacity = index === 0 ? 'opacity-100' : index === 1 ? 'opacity-60' : 'opacity-30';
    const scale = index === 0 ? 'scale-100' : index === 1 ? 'scale-95' : 'scale-90';
    
    return (
      <button 
        onClick={onClick}
        disabled={!isTop}
        className={`
          group relative w-full h-14 md:h-16 rounded-xl border-b-4 
          ${colorClasses} 
          ${opacity} ${scale}
          ${isTop ? 'cursor-pointer hover:brightness-110 active:border-b-0 active:translate-y-1' : 'cursor-default border-b-2'}
          transition-all duration-300
          flex items-center justify-center
          shadow-lg
        `}
      >
        <div className="flex flex-col items-center gap-1 scale-90">
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-black/80 rounded-full" />
                <div className="w-1.5 h-1.5 bg-black/80 rounded-full" />
            </div>
            <div className="w-4 h-2 bg-black/20 rounded-full" />
        </div>
        
        <div className="absolute top-1 right-1 w-5 h-5 bg-black/40 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            {pig.ammo}
        </div>
      </button>
    );
};

export default App;