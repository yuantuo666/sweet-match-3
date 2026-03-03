import { useState, useEffect, useCallback, useRef } from 'react';

export type TileType = 'HEART' | 'STRAWBERRY' | 'BLUEBERRY' | 'CAKE' | 'FLOWER';

export interface Tile {
  id: string;
  type: TileType;
  x: number;
  y: number;
}

const GRID_SIZE = 8;
const TILE_TYPES: TileType[] = ['HEART', 'STRAWBERRY', 'BLUEBERRY', 'CAKE', 'FLOWER'];

const generateId = () => Math.random().toString(36).substr(2, 9);

const getRandomType = (): TileType => {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
};

const createInitialGrid = (): Tile[] => {
  const grid: Tile[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      let type = getRandomType();
      // Simple initial check to avoid immediate matches (not perfect but good enough for start)
      while (
        (x >= 2 && grid.find(t => t.x === x - 1 && t.y === y)?.type === type && grid.find(t => t.x === x - 2 && t.y === y)?.type === type) ||
        (y >= 2 && grid.find(t => t.x === x && t.y === y - 1)?.type === type && grid.find(t => t.x === x && t.y === y - 2)?.type === type)
      ) {
        type = getRandomType();
      }
      grid.push({ id: generateId(), type, x, y });
    }
  }
  return grid;
};

export const useMatch3 = () => {
  const [grid, setGrid] = useState<Tile[]>(createInitialGrid());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(20);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // We use a ref to track if we are in a "revert swap" phase to avoid match checking loop
  const isRevertingSwap = useRef(false);

  // Helper to find matches
  const findMatches = useCallback((currentGrid: Tile[]) => {
    const matches = new Set<string>();

    // Horizontal
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE - 2; x++) {
        const t1 = currentGrid.find(t => t.x === x && t.y === y);
        const t2 = currentGrid.find(t => t.x === x + 1 && t.y === y);
        const t3 = currentGrid.find(t => t.x === x + 2 && t.y === y);
        if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type) {
          matches.add(t1.id);
          matches.add(t2.id);
          matches.add(t3.id);
        }
      }
    }

    // Vertical
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE - 2; y++) {
        const t1 = currentGrid.find(t => t.x === x && t.y === y);
        const t2 = currentGrid.find(t => t.x === x && t.y === y + 1);
        const t3 = currentGrid.find(t => t.x === x && t.y === y + 2);
        if (t1 && t2 && t3 && t1.type === t2.type && t2.type === t3.type) {
          matches.add(t1.id);
          matches.add(t2.id);
          matches.add(t3.id);
        }
      }
    }

    return Array.from(matches);
  }, []);

  // Game Loop Effect
  useEffect(() => {
    if (gameOver || isRevertingSwap.current) return;

    let timeoutId: NodeJS.Timeout;

    const processGame = () => {
      const matches = findMatches(grid);

      if (matches.length > 0) {
        setIsProcessing(true);

        // 1. Wait for match animation
        timeoutId = setTimeout(() => {
          // 2. Remove matches and update score
          setScore(prev => prev + matches.length * 10);
          
          const remainingTiles = grid.filter(t => !matches.includes(t.id));
          
          // 3. Apply Gravity
          const newGrid = [...remainingTiles];
          
          // Adjust Y positions and spawn new tiles column by column
          for (let x = 0; x < GRID_SIZE; x++) {
            // Get tiles in this column
            const colTiles = newGrid.filter(t => t.x === x);
            
            // Sort them by Y descending (bottom first) to stack them properly
            colTiles.sort((a, b) => b.y - a.y);
            
            // Stack existing tiles at the bottom
            let currentY = GRID_SIZE - 1;
            colTiles.forEach(tile => {
              tile.y = currentY;
              currentY--;
            });

            // Fill the top empty slots with new tiles
            const missingCount = GRID_SIZE - colTiles.length;
            for (let i = 0; i < missingCount; i++) {
              newGrid.push({
                id: generateId(),
                type: getRandomType(),
                x,
                y: missingCount - 1 - i // Fill from bottom of empty space up to 0
              });
            }
          }

          setGrid([...newGrid]);
          
          // The effect will run again to check for new matches
        }, 600);
      } else {
        setIsProcessing(false);
        if (moves <= 0) {
          setGameOver(true);
        }
      }
    };

    // Debounce to avoid rapid firing
    const timer = setTimeout(processGame, 300);
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
    };
  }, [grid, moves, gameOver, findMatches]);

  const handleTileClick = async (id: string) => {
    if (isProcessing || gameOver) return;

    if (!selectedTileId) {
      setSelectedTileId(id);
      return;
    }

    if (selectedTileId === id) {
      setSelectedTileId(null);
      return;
    }

    const t1 = grid.find(t => t.id === selectedTileId);
    const t2 = grid.find(t => t.id === id);

    if (!t1 || !t2) {
      setSelectedTileId(null);
      return;
    }

    // Check adjacency
    const isAdjacent =
      (Math.abs(t1.x - t2.x) === 1 && t1.y === t2.y) ||
      (Math.abs(t1.y - t2.y) === 1 && t1.x === t2.x);

    if (!isAdjacent) {
      setSelectedTileId(id);
      return;
    }

    // Perform Swap
    const newGrid = grid.map(t => {
      if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
      if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
      return t;
    });

    // Optimistic update
    setGrid(newGrid);
    setSelectedTileId(null);
    setIsProcessing(true);

    // Check if valid
    const matches = findMatches(newGrid);

    if (matches.length > 0) {
      // Valid swap
      setMoves(prev => prev - 1);
      // Effect will handle the match removal
    } else {
      // Invalid swap - Revert
      isRevertingSwap.current = true;
      setTimeout(() => {
        setGrid(grid); // Revert to old grid
        setIsProcessing(false);
        isRevertingSwap.current = false;
      }, 500);
    }
  };

  const restartGame = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setMoves(20);
    setGameOver(false);
    setIsProcessing(false);
    setSelectedTileId(null);
  };

  return {
    grid,
    score,
    moves,
    selectedTileId,
    isProcessing,
    gameOver,
    handleTileClick,
    restartGame
  };
};
