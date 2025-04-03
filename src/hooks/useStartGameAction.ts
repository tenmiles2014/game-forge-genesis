
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface StartGameActionProps {
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  resetPosition?: () => void;
}

export function useStartGameAction({
  setGamePaused,
  setTimerActive,
  setControlsEnabled,
  resetPosition
}: StartGameActionProps) {
  const startGame = useCallback(() => {
    console.log("🚀 Starting game - sequence initiated");
    
    // If we have a reset position function, call it to ensure block starts from the top
    if (resetPosition) {
      resetPosition();
    }
    
    // Sequential state updates with small delays to ensure proper order
    setTimeout(() => {
      // First enable controls
      console.log("🔓 Enabling controls");
      setControlsEnabled(true);
      
      setTimeout(() => {
        // Then activate the timer
        console.log("⏱️ Activating timer");
        setTimerActive(true);
        
        setTimeout(() => {
          // Finally unpause the game
          console.log("▶️ Unpausing game");
          setGamePaused(false);
          
          // Show a toast notification
          toast({
            title: "Game Started",
            description: "Use arrow keys to move and Z/X to rotate blocks",
          });
          
          console.log("✅ Game started - controls enabled, timer active, game unpaused");
        }, 100);
      }, 100);
    }, 100);
  }, [setGamePaused, setTimerActive, setControlsEnabled, resetPosition]);

  return { startGame };
}
