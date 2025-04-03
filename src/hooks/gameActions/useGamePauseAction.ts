
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface GamePauseActionProps {
  gravityTimerRef: React.MutableRefObject<number | null>;
  setGamePaused: (paused: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
}

export function useGamePauseAction({
  gravityTimerRef,
  setGamePaused,
  setTimerActive,
  setControlsEnabled
}: GamePauseActionProps) {
  const toggleGamePause = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    // Save current state to use in the toast message
    let newPausedState = false;
    
    setGamePaused(prevPaused => {
      newPausedState = !prevPaused;
      
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
      
      return newPausedState;
    });
    
    // Use direct boolean values instead of functional updates
    setTimerActive(false); // Will be updated by the effect that watches gamePaused
    setControlsEnabled(false); // Will be updated by the effect that watches gamePaused
    
  }, [gravityTimerRef, setGamePaused, setTimerActive, setControlsEnabled]);

  return { toggleGamePause };
}
