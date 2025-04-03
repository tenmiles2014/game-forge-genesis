
import { useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
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
  
  // Initialize blocks with random patterns
  const initializeBlocks = useCallback(() => {
    console.log("🎲 Initializing block patterns");
    const firstBlock = getRandomBlockPattern();
    const secondBlock = getRandomBlockPattern();
    
    setCurrentBlock(firstBlock);
    setNextBlock(secondBlock);
    
    // Create a fresh position object
    const freshPosition = {
      x: INITIAL_POSITION.x,
      y: INITIAL_POSITION.y,
      z: INITIAL_POSITION.z
    };
    
    setPosition(freshPosition);
    
    console.log("✅ Block patterns initialized");
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);
  
  // Initialize the game state
  const initializeGame = useCallback(() => {
    console.log("🚀 Game initialization started");
    
    // Initialize grid
    const newGrid = initializeGrid();
    console.log("📊 Grid initialized:", newGrid.length);
    setGrid(newGrid);
    
    // Reset game state
    setScore(0);
    setLinesCleared(0);
    setGameOver(false);
    setGamePaused(true);
    setControlsEnabled(false);
    
    // Initialize blocks
    initializeBlocks();
    
    console.log("✅ Game initialization complete");
    
    toast({
      title: "Game Ready",
      description: "Press Start to begin playing!",
    });
  }, [
    initializeGrid, 
    setGrid, 
    setGameOver, 
    setGamePaused, 
    setScore, 
    setLinesCleared,
    setControlsEnabled, 
    initializeBlocks
  ]);

  // Auto-initialize on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return { initializeGame, initializeBlocks };
}
