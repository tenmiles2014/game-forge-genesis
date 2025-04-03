
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

    // Initialize grid, blocks, and game state
    setGrid((prevGrid) => {
      const size = prevGrid.length || 10;
      return Array.from({ length: size }, () => 
        Array.from({ length: size }, () => 
          Array.from({ length: size }, () => 0)
        )
      );
    });

    setCurrentBlock(initialBlock);
    setNextBlock(nextBlock);
    setPosition(INITIAL_POSITION);
    setGameOver(false);
    setGamePaused(true);
    setScore(0);
    setLinesCleared(0);
    setControlsEnabled(false);

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
