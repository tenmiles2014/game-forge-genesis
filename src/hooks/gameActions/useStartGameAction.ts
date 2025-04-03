
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
    // Set gamePaused to false to start the game
    setGamePaused(false);
    
    // Activate the timer and enable controls
    setTimerActive(true);
    setControlsEnabled(true);
    
    // Show a toast notification
    toast({
      title: "Game Started",
      description: "Use arrow keys to move and Z/X to rotate blocks",
    });
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
