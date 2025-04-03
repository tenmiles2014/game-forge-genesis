
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";

export function useDropBlockAction({
  grid,
  setGrid,
  currentBlock,
  position,
  setPosition,
  setCurrentBlock,
  setNextBlock,
  setScore,
  setLinesCleared,
  setGameOver,
  setTimerActive,
  setControlsEnabled,
  gravityTimerRef,
  spawnNextBlock,
  isValidPosition,
  clearCompleteLayers,
  checkVerticalStackLimit,
  placeBlock
}) {
  const dropBlock = useCallback(() => {
    console.log("🔽 Dropping block");
    
    // Place the current block in the grid
    const placementResult = placeBlock(grid, currentBlock, position);
    
    if (placementResult) {
      // Increase score for successful drop
      setScore(prev => prev + 10);
      
      // Check for complete layers and clear them
      const { clearedLayers, newGrid } = clearCompleteLayers(grid);
      
      if (clearedLayers > 0) {
        setGrid(newGrid);
        setLinesCleared(prev => prev + clearedLayers);
        
        toast({
          title: `${clearedLayers} Layer${clearedLayers > 1 ? 's' : ''} Cleared!`,
          description: `Bonus points earned!`
        });
      }
      
      // Check vertical stack limit
      const stackExceeded = checkVerticalStackLimit(newGrid);
      
      if (stackExceeded) {
        setGameOver(true);
        setTimerActive(false);
        setControlsEnabled(false);
        
        toast({
          title: "Game Over",
          description: "Block stack exceeded limit!",
          variant: "destructive"
        });
      } else {
        // Spawn next block
        spawnNextBlock();
      }
    }
  }, [
    grid, 
    currentBlock, 
    position, 
    setGrid, 
    setScore, 
    setLinesCleared, 
    setGameOver, 
    setTimerActive, 
    setControlsEnabled, 
    spawnNextBlock, 
    placeBlock, 
    clearCompleteLayers, 
    checkVerticalStackLimit
  ]);

  return { dropBlock };
}
