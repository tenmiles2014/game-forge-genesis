
import { toast } from "@/components/ui/use-toast";

export function handleGameOver(
  reason: string,
  setGameOver: (gameOver: boolean) => void,
  setTimerActive: (active: boolean) => void,
  setControlsEnabled: (enabled: boolean) => void,
  gravityTimerRef: React.MutableRefObject<number | null>
): void {
  console.log(`🎮 Game over: ${reason}`);
  
  if (gravityTimerRef.current) {
    clearInterval(gravityTimerRef.current);
    gravityTimerRef.current = null;
  }
  
  setGameOver(true);
  setTimerActive(false);
  setControlsEnabled(false);
  
  toast({
    title: "Game Over",
    description: reason,
    variant: "destructive"
  });
}
