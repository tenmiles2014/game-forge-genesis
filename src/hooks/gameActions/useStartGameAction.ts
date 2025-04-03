
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
    setGamePaused(false);
    setTimerActive(true);
    setControlsEnabled(true);
    
    toast({
      title: "Game Started",
      description: "Good luck!",
    });
  }, [setGamePaused, setTimerActive, setControlsEnabled]);

  return { startGame };
}
