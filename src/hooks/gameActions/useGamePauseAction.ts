
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface GamePauseActionProps {
  gravityTimerRef: React.MutableRefObject<number | null>;
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  gamePaused: boolean; // Add the current pause state as a prop
}

export function useGamePauseAction({
  gravityTimerRef,
  setGamePaused,
  setTimerActive,
  setControlsEnabled,
  gamePaused
}: GamePauseActionProps) {
  const toggleGamePause = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Toggle the game pause state directly
    const newPausedState = !gamePaused;
    setGamePaused(newPausedState);
    
    if (newPausedState) {
      toast({
        title: "Game Paused",
        description: "Take a breather!",
      });
    } else {
      toast({
        title: "Game Resumed",
        description: "Let's go!",
      });
    }
    
    // Use direct boolean values
    setTimerActive(false); // Will be updated by the effect that watches gamePaused
    setControlsEnabled(false); // Will be updated by the effect that watches gamePaused
    
  }, [gravityTimerRef, setGamePaused, setTimerActive, setControlsEnabled, gamePaused]);

  return { toggleGamePause };
}
