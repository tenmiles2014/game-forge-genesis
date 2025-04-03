
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface TimeUpActionProps {
  setGameOver: (gameOver: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  score: number;
  level: number;
}

export function useTimeUpAction({
  setGameOver,
  setTimerActive,
  setControlsEnabled,
  gravityTimerRef,
  score,
  level
}: TimeUpActionProps) {
  const handleTimeUp = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    setGameOver(true);
    setTimerActive(false);
    setControlsEnabled(false);
    
    toast({
      title: "Time's Up!",
      description: `Game Over! Score: ${score} | Level: ${level}`,
      variant: "destructive"
    });
  }, [gravityTimerRef, setGameOver, setTimerActive, setControlsEnabled, score, level]);

  return { handleTimeUp };
}
