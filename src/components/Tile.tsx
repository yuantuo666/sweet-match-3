import { FC } from 'react';
import { motion } from 'motion/react';
import { Tile as TileType } from '../hooks/useMatch3';

interface TileProps {
  tile: TileType;
  isSelected: boolean;
  onClick: (id: string) => void;
  width: number;
  height: number;
}

const EMOJI_MAP: Record<string, string> = {
  HEART: '❤️',
  STRAWBERRY: '🍓',
  BLUEBERRY: '🫐',
  CAKE: '🍰',
  FLOWER: '🌸',
};

const BG_COLOR_MAP: Record<string, string> = {
  HEART: 'bg-red-100 border-red-200',
  STRAWBERRY: 'bg-rose-100 border-rose-200',
  BLUEBERRY: 'bg-blue-100 border-blue-200',
  CAKE: 'bg-orange-50 border-orange-100',
  FLOWER: 'bg-pink-100 border-pink-200',
};

export const Tile: FC<TileProps> = ({ tile, isSelected, onClick, width, height }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.1 : 1, 
        opacity: 1,
        x: tile.x * width,
        y: tile.y * height
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`absolute top-0 left-0 flex items-center justify-center cursor-pointer`}
      style={{ width, height }}
      onClick={() => onClick(tile.id)}
    >
      <div 
        className={`
          w-[90%] h-[90%] rounded-lg md:rounded-2xl shadow-sm border-2 
          flex items-center justify-center text-xl md:text-3xl select-none
          transition-colors duration-200
          ${BG_COLOR_MAP[tile.type]}
          ${isSelected ? 'ring-4 ring-pink-400 ring-opacity-50 z-10' : 'hover:brightness-95'}
        `}
      >
        <span className="filter drop-shadow-sm">{EMOJI_MAP[tile.type]}</span>
      </div>
    </motion.div>
  );
};
