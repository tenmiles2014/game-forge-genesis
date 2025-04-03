
import { useCallback } from 'react';
import { getRandomBlockPattern } from '../../components/BlockPatterns';

interface UseGameInitializationProps {
  initializeGrid: () => number[][][];
  setGrid: (grid: number[][][]) => void;
  setCurrentBlock: (block: any) => void;
  setNextBlock: (block: any) => void;
  setPosition: (position: { x: number; y: number; z: number }) => void;
  setGameOver: (gameOver: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  setScore: (score: number) => void;
  setLinesCleared: (linesCleared: number) => void;
  setControlsEnabled: (enabled: boolean) => void;
  INITIAL_POSITION: { x: number; y: number; z: number };
}

export function useGameInitialization({
  initializeGrid,
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
}: UseGameInitializationProps) {
  const initializeGame = useCallback(() => {
    const initialBlock = getRandomBlockPattern();
    const nextBlock = getRandomBlockPattern();

    console.log("🚀 Initializing game with position:", INITIAL_POSITION);

    // Initialize grid, blocks, and game state
    const newGrid = initializeGrid();
    console.log("📊 Grid initialized:", newGrid.length);
    setGrid(newGrid);
    
    setCurrentBlock(initialBlock);
    setNextBlock(nextBlock);
    setPosition({...INITIAL_POSITION}); // Use spread to ensure we create a new object
    setGameOver(false);
    setGamePaused(true); // Start paused
    setScore(0);
    setLinesCleared(0);
    setControlsEnabled(true); // Set controls to enabled by default

    console.log("✅ Game initialization complete - Controls enabled");

  }, [
    initializeGrid, 
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
