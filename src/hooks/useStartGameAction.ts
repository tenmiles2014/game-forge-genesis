
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
    
    // First enable controls
    setControlsEnabled(true);
    
    // Then activate the timer
    setTimerActive(true);
    
    // Finally unpause the game
    setGamePaused(false);
    
    console.log("Game started - controlsEnabled: true, gamePaused: false");
    
    // Show a toast notification
    toast({
      title: "Game Started",
      description: "Use arrow keys to move and Z/X to rotate blocks",
    });
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
