
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
    console.log("Starting game - setting states for gameplay");
    
    // Enable controls first
    setControlsEnabled(true);
    
    // Small delay before continuing with other state changes
    setTimeout(() => {
      // Activate timer
      setTimerActive(true);
      
      // Unpause the game - MUST be last for proper state synchronization
      setGamePaused(false);
      
      console.log("Game fully started - controlsEnabled: true, timerActive: true, gamePaused: false");
      
      // Show a toast notification
      toast({
        title: "Game Started",
        description: "Use arrow keys to move and Z/X to rotate blocks",
      });
    }, 50);
    
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
