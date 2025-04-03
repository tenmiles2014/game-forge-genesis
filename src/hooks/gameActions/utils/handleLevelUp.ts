
import { toast } from "@/components/ui/use-toast";

export function handleLevelUp(
  layersCleared: number, 
  currentLevel: number, 
  MAX_LEVEL: number,
  setLevel: (level: number) => void
): void {
  if (layersCleared > 0 && currentLevel < MAX_LEVEL) {
    const newLevel = Math.min(MAX_LEVEL, Math.floor(1 + (currentLevel + (layersCleared / 10))));
    
    if (newLevel > currentLevel) {
      console.log(`🎮 Level up! Now at level ${newLevel}`);
      setLevel(newLevel);
      
      toast({
        title: "Level Up!",
        description: `Now at Level ${newLevel}`,
      });
    }
  }
}
