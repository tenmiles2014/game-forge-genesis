
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface StartGameActionProps {
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
}

export function useStartGameAction({
  setGamePaused,
  setTimerActive,
  setControlsEnabled
}: StartGameActionProps) {
  const startGame = useCallback(() => {
    console.log("Starting game - setting gamePaused to false");
    
    // Set controlsEnabled first to ensure controls work immediately
    setControlsEnabled(true);
    
    // Set gamePaused to false to start the game
    setGamePaused(false);
    
    // Activate the timer
    setTimerActive(true);
    
    console.log("Game started - controlsEnabled: true, gamePaused: false");
    
    // Show a toast notification
    toast({
      title: "Game Started",
      description: "Use arrow keys to move and Z/X to rotate blocks",
    });
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
