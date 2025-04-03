
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
    
    // First, enable controls to ensure they're active when the game starts
    setControlsEnabled(true);
    
    // Then set game state to not paused
    setGamePaused(false);
    
    // Finally activate the timer
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
