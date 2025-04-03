
import { useCallback } from 'react';
import { getRandomBlockPattern } from '../../components/BlockPatterns';

export function useGameInitialization({
  setGrid,
  setCurrentBlock,
  setNextBlock,
  setPosition,
  setGameOver,
  setGamePaused,
  setScore,
  setLinesCleared,
  setControlsEnabled,
  INITIAL_POSITION
}) {
  const initializeGame = useCallback(() => {
    const initialBlock = getRandomBlockPattern();
    const nextBlock = getRandomBlockPattern();

    console.log("Initializing game with position:", INITIAL_POSITION);

    // Initialize grid, blocks, and game state
    setGrid((prevGrid) => {
      const size = prevGrid?.length || 10;
      return Array.from({ length: size }, () => 
        Array.from({ length: size }, () => 
          Array.from({ length: size }, () => 0)
        )
      );
    });

    setCurrentBlock(initialBlock);
    setNextBlock(nextBlock);
    setPosition({...INITIAL_POSITION}); // Use spread to ensure we create a new object
    setGameOver(false);
    setGamePaused(true);
    setScore(0);
    setLinesCleared(0);
    setControlsEnabled(false);

    // Make sure the block is positioned at the top of the grid
    console.log("Game initialized with block at position:", INITIAL_POSITION);

  }, [
    setGrid, 
    setCurrentBlock, 
    setNextBlock, 
    setPosition,
    setGameOver, 
    setGamePaused, 
    setScore, 
    setLinesCleared, 
    setControlsEnabled, 
    INITIAL_POSITION
  ]);

  return { initializeGame };
}
