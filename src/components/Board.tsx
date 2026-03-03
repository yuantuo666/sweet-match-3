import { Tile } from './Tile';
import { useMatch3 } from '../hooks/useMatch3';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trophy, Move } from 'lucide-react';
import { FC } from 'react';

const RewardPopup: FC<{ text: string; type: 'small' | 'medium' | 'large' | 'combo'; index: number }> = ({ text, type, index }) => {
  const variants = {
    initial: { scale: 0, opacity: 0, y: 20, rotate: -10 },
    animate: { 
      scale: type === 'large' ? 1.5 : type === 'medium' ? 1.2 : 1, 
      opacity: 1, 
      y: -50 - (index * 40), // Stack vertically
      rotate: 0,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { scale: 2, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } }
  };

  const colors = {
    small: 'text-pink-500',
    medium: 'text-purple-600',
    large: 'text-yellow-500',
    combo: 'text-orange-500'
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`absolute inset-0 flex items-center justify-center pointer-events-none z-50`}
      style={{ zIndex: 50 + index }}
    >
      <h2 className={`text-5xl font-black ${colors[type]} drop-shadow-lg stroke-white tracking-wider whitespace-nowrap`}>
        {text}
      </h2>
    </motion.div>
  );
};

export const Board = () => {
  const { grid, score, moves, selectedTileId, gameOver, rewards, handleTileClick, restartGame } = useMatch3();
  
  // Board dimensions
  const GRID_SIZE = 8;
  const TILE_SIZE = 60; // Base size, can be responsive
  const BOARD_SIZE = GRID_SIZE * TILE_SIZE;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-4 font-sans">
      
      {/* Header / Stats */}
      <div className="flex gap-8 mb-8 bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/40">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-pink-500 font-bold uppercase text-xs tracking-wider mb-1">
            <Trophy size={14} /> Score
          </div>
          <span className="text-2xl font-black text-gray-800 font-mono">{score}</span>
        </div>
        
        <div className="w-px bg-gray-300/50 h-12 self-center"></div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-purple-500 font-bold uppercase text-xs tracking-wider mb-1">
            <Move size={14} /> Moves
          </div>
          <span className={`text-2xl font-black font-mono ${moves < 5 ? 'text-red-500' : 'text-gray-800'}`}>
            {moves}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      <div 
        className="relative bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-white/50 overflow-hidden"
        style={{ width: BOARD_SIZE + 16, height: BOARD_SIZE + 16 }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        
        {/* Tiles Layer */}
        <div className="relative w-full h-full p-2">
          <AnimatePresence>
            {grid.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                isSelected={selectedTileId === tile.id}
                onClick={handleTileClick}
                width={TILE_SIZE}
                height={TILE_SIZE}
              />
            ))}
          </AnimatePresence>
          
          {/* Reward Popup */}
          <AnimatePresence>
            {rewards.map((reward, index) => (
              <RewardPopup 
                key={reward.id} 
                text={reward.text} 
                type={reward.type} 
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm mx-4 border-4 border-pink-200"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-black text-gray-800 mb-2">Game Over!</h2>
                <p className="text-gray-500 mb-6">You scored <span className="font-bold text-pink-500">{score}</span> points!</p>
                
                <button
                  onClick={restartGame}
                  className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Play Again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="mt-8 flex gap-4">
        <button 
          onClick={restartGame}
          className="p-3 bg-white/50 hover:bg-white/80 rounded-full text-gray-600 hover:text-pink-500 transition-colors shadow-sm backdrop-blur-sm"
          title="Restart Game"
        >
          <RefreshCw size={24} />
        </button>
      </div>

    </div>
  );
};
