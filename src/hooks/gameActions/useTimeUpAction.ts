
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

interface TimeUpActionProps {
  gameOver: boolean; // Add gameOver property
  setGameOver: (gameOver: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  score: number;
  level: number;
}

export function useTimeUpAction({
  gameOver,
  setGameOver,
  setTimerActive,
  setControlsEnabled,
  gravityTimerRef,
  score,
  level
}: TimeUpActionProps) {
  const handleTimeUp = useCallback(() => {
    // Skip if game is already over
    if (gameOver) {
      console.log("Game already over, not handling time up");
      return;
    }
    
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
  }, [gameOver, gravityTimerRef, setGameOver, setTimerActive, setControlsEnabled, score, level]);

  return { handleTimeUp };
}
