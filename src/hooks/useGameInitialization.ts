
import { useCallback, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";

interface UseGameInitializationProps {
  initializeGrid: () => number[][][];
  setGrid: (grid: number[][][]) => void;
  setGameOver: (gameOver: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  setScore: (score: number) => void;
  setLinesCleared: (linesCleared: number) => void;
  setControlsEnabled: (enabled: boolean) => void;
  initializeBlocks: () => void;
}

export function useGameInitialization({
  initializeGrid,
  setGrid,
  setGameOver,
  setGamePaused,
  setScore,
  setLinesCleared,
  setControlsEnabled,
  initializeBlocks
}: UseGameInitializationProps) {
  
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

  return { initializeGame };
}
