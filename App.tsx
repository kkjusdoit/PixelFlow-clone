
import React from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { PixelGrid } from './components/PixelGrid';
import { RailSystem } from './components/RailSystem';
import { ColorID, ColorMap, GameState, Shooter } from './types';
import { Trophy, RefreshCcw, Skull, Play, PackagePlus } from 'lucide-react';

const App: React.FC = () => {
  const { 
    grid, 
    shooters, 
    inventory, 
    score, 
    gameState, 
    spawnShooter, 
    setGameState 
  } = useGameLoop();

  const handleRestart = () => {
    window.location.reload(); // Simple reload for prototype
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between py-4 px-2 md:py-8 font-sans">
      
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-white rounded-xs"></div>
              <div className="w-2 h-2 bg-white/50 rounded-xs"></div>
              <div className="w-2 h-2 bg-white/50 rounded-xs"></div>
              <div className="w-2 h-2 bg-white rounded-xs"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pixel Flow
            </h1>
            <p className="text-xs text-slate-400 font-mono">LEVEL 01</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">{score.toString().padStart(5, '0')}</p>
            </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full flex items-center justify-center relative">
        <RailSystem shooters={shooters}>
          <PixelGrid grid={grid} />
        </RailSystem>
        
        {/* Game Over / Victory Overlay */}
        {gameState !== GameState.Playing && (
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
                  <button 
                    onClick={handleRestart}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 w-full justify-center"
                  >
                    <RefreshCcw className="w-5 h-5" /> Play Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                    <Skull className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">System Failure</h2>
                  <p className="text-slate-400 mb-6">Inventory overflow or critical error.</p>
                  <button 
                    onClick={handleRestart}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full justify-center"
                  >
                    <RefreshCcw className="w-5 h-5" /> Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inventory / Controls */}
      <div className="w-full max-w-2xl mt-4">
        <div className="bg-slate-800/80 backdrop-blur rounded-t-2xl p-4 border-t border-x border-slate-700 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <PackagePlus className="w-4 h-4" /> REINFORCEMENTS
            </h3>
            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md">
              Tap to deploy
            </span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
            {inventory.length === 0 ? (
                <div className="w-full text-center py-4 text-slate-500 text-sm italic">
                    Inventory Empty - Wait for recycling...
                </div>
            ) : (
                inventory.map((pig) => (
                <InventoryItem 
                    key={pig.id} 
                    pig={pig} 
                    onClick={() => spawnShooter(pig.id)} 
                />
                ))
            )}
            
            {/* Filler slots visual */}
            {Array.from({ length: Math.max(0, 8 - inventory.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="min-w-[4rem] h-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Inventory Item
const InventoryItem: React.FC<{ pig: Shooter; onClick: () => void }> = ({ pig, onClick }) => {
    // Map ColorID to tailwind classes
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
  
    return (
      <button 
        onClick={onClick}
        className={`
          group relative min-w-[4rem] h-16 rounded-xl border-b-4 
          ${colorClasses} 
          active:border-b-0 active:translate-y-1 transition-all
          flex items-center justify-center hover:brightness-110
        `}
      >
        {/* Pig Face Visual */}
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-black/80 rounded-full" />
                <div className="w-1.5 h-1.5 bg-black/80 rounded-full" />
            </div>
            <div className="w-4 h-2 bg-black/20 rounded-full" />
        </div>
        
        {/* Ammo Badge */}
        <div className="absolute top-1 right-1 w-5 h-5 bg-black/40 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            {pig.ammo}
        </div>
      </button>
    );
};

export default App;
