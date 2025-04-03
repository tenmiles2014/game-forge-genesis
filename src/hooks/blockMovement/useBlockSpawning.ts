
import { useCallback } from 'react';
import { BlockPattern } from '../../components/BlockPatterns';
import { toast } from "@/components/ui/use-toast";

interface UseBlockSpawningProps {
  getRandomBlockPattern: () => BlockPattern;
  setCurrentBlock: (block: BlockPattern) => void;
  setNextBlock: (block: BlockPattern) => void;
  setPosition: (position: { x: number; y: number; z: number }) => void;
  INITIAL_POSITION: { x: number; y: number; z: number };
  isValidPosition: (position: { x: number; y: number; z: number }) => boolean;
}

export function useBlockSpawning({
  getRandomBlockPattern,
  setCurrentBlock,
  setNextBlock,
  setPosition,
  INITIAL_POSITION,
  isValidPosition
}: UseBlockSpawningProps) {
  
  // Initialize block patterns at game start
  const initializeBlocks = useCallback(() => {
    console.log("🎲 Initializing block patterns");
    const firstBlock = getRandomBlockPattern();
    const secondBlock = getRandomBlockPattern();
    
    setCurrentBlock(firstBlock);
    setNextBlock(secondBlock);
    setPosition({...INITIAL_POSITION});
    
    console.log("✅ Block patterns initialized:", {
      current: firstBlock.color,
      next: secondBlock.color,
      position: INITIAL_POSITION
    });
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  // Spawn next block at starting position
  const spawnNextBlock = useCallback(() => {
    console.log("🔄 Spawning next block");
    const newNextBlock = getRandomBlockPattern();
    
    setCurrentBlock((prevCurrentBlock) => {
      console.log("📦 Current block updated:", {
        from: prevCurrentBlock?.color,
        to: newNextBlock.color
      });
      return newNextBlock;
    });
    
    setNextBlock(newNextBlock);
    
    // Reset position for the new block
    const spawnPosition = {
      x: INITIAL_POSITION.x,
      y: INITIAL_POSITION.y,
      z: INITIAL_POSITION.z
    };
    
    console.log(`📍 Resetting position to spawn point: ${JSON.stringify(spawnPosition)}`);
    setPosition(spawnPosition);
    
    // Return whether the spawn position is valid (for game over detection)
    const isValid = isValidPosition(spawnPosition);
    console.log(`${isValid ? '✅ Valid' : '❌ Invalid'} spawn position`);
    return isValid;
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION, isValidPosition]);

  return {
    initializeBlocks,
    spawnNextBlock
  };
}
