
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface StartGameActionProps {
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  resetPosition?: () => void;
  setGrid?: (grid: number[][][]) => void;
  initializeGrid?: () => number[][][];
}

export function useStartGameAction({
  setGamePaused,
  setTimerActive,
  setControlsEnabled,
  resetPosition,
  setGrid,
  initializeGrid
}: StartGameActionProps) {
  const startGame = useCallback(() => {
    console.log("🚀 Starting game - sequence initiated");
    
    // Reinitialize the grid if needed
    if (setGrid && initializeGrid) {
      console.log("🧩 Reinitializing grid");
      const freshGrid = initializeGrid();
      setGrid(freshGrid);
    }
    
    // If we have a reset position function, call it to ensure block starts from the top
    if (resetPosition) {
      console.log("🔄 Resetting block position");
      resetPosition();
    }
    
    console.log("🔓 Enabling controls");
    setControlsEnabled(true);
    
    // Important: First activate the timer, then unpause the game
    console.log("⏱️ Activating timer");
    setTimerActive(true);
    
    console.log("▶️ Unpausing game");
    setGamePaused(false);
    
    toast({
      title: "Game Started",
      description: "Use arrow keys to move and Z/X to rotate blocks",
    });
    
    console.log("✅ Game started - controls enabled, timer active, game unpaused");
  }, [setGamePaused, setTimerActive, setControlsEnabled, resetPosition, setGrid, initializeGrid]);

  return { startGame };
}
