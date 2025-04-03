
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
    
    setGamePaused(prevPaused => {
      const newPausedState = !prevPaused;
      
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
    
    setTimerActive(prevActive => !prevActive);
    setControlsEnabled(prevEnabled => !prevEnabled);
  }, [gravityTimerRef, setGamePaused, setTimerActive, setControlsEnabled]);

  return { toggleGamePause };
}
