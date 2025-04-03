
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
    console.log("🚀 Start Game Action Initiated");
    
    // Sequence of state changes with explicit logging and delays
    const gameStartSequence = () => {
      console.log("🔓 Enabling controls");
      setControlsEnabled(true);
      
      // Small delay to ensure state propagation
      setTimeout(() => {
        console.log("⏱️ Activating timer");
        setTimerActive(true);
        
        // Another small delay before unpausing
        setTimeout(() => {
          console.log("▶️ Unpausing game");
          setGamePaused(false);
          
          // Final confirmation toast
          toast({
            title: "Game Started 🎮",
            description: "Use arrow keys to move and Z/X to rotate blocks",
            duration: 3000
          });
        }, 100);
      }, 50);
    };

    // Immediate execution with potential retry mechanism
    try {
      gameStartSequence();
    } catch (error) {
      console.error("❌ Game start failed:", error);
      
      // Optional retry after a short delay
      setTimeout(() => {
        try {
          gameStartSequence();
        } catch (retryError) {
          console.error("❌ Game start retry failed:", retryError);
          toast({
            title: "Game Start Error",
            description: "Unable to start the game. Please refresh.",
            variant: "destructive"
          });
        }
      }, 500);
    }
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
