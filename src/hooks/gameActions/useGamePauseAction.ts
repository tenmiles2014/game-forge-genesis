
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface GamePauseActionProps {
  gravityTimerRef: React.MutableRefObject<number | null>;
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  gamePaused: boolean; // Add the current pause state as a prop
  gameOver: boolean; // Add gameOver property
}

export function useGamePauseAction({
  gravityTimerRef,
  setGamePaused,
  setTimerActive,
  gamePaused,
  gameOver
}: GamePauseActionProps) {
  const toggleGamePause = useCallback(() => {
    console.log("🔄 Toggle Game Pause Action Triggered");
    
    // Don't allow pausing if game is over
    if (gameOver) {
      console.log("Game is over, cannot toggle pause");
      return;
    }
    
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Toggle the game pause state directly
    const newPausedState = !gamePaused;
    console.log(`Setting game pause state to: ${newPausedState}`);
    setGamePaused(newPausedState);
    
    if (newPausedState) {
      // Game is being paused
      console.log("Game paused - disabling controls and timer");
      setTimerActive(false);
      
      toast({
        title: "Game Paused",
        description: "Take a breather!",
      });
    } else {
      // Game is being unpaused
      console.log("Game unpaused - enabling controls and timer");
      setTimerActive(true);
      
      toast({
        title: "Game Resumed",
        description: "Let's go!",
      });
    }
    
  }, [gravityTimerRef, setGamePaused, setTimerActive, gamePaused, gameOver]);

  return { toggleGamePause };
}
