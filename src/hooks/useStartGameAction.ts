
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
    console.log("🚀 Starting game - sequence initiated");
    
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
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
