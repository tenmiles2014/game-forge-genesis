
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
    
    // Always create a fresh copy of the position object to avoid reference issues
    const freshPosition = {
      x: INITIAL_POSITION.x,
      y: INITIAL_POSITION.y,
      z: INITIAL_POSITION.z
    };
    
    setPosition(freshPosition);
    
    console.log("✅ Block patterns initialized:", {
      current: firstBlock.color,
      next: secondBlock.color,
      position: freshPosition
    });
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  // Spawn next block at starting position
  const spawnNextBlock = useCallback(() => {
    console.log("🔄 Spawning next block");
    
    let nextBlockToUse: BlockPattern | null = null;
    
    // Get the next block that was previously prepared
    setCurrentBlock((prevNextBlock) => {
      nextBlockToUse = prevNextBlock;
      console.log("📦 Current block updated to:", prevNextBlock?.color);
      return prevNextBlock;
    });
    
    // Create a new next block
    const newNextBlock = getRandomBlockPattern();
    console.log("🔮 New next block prepared:", newNextBlock?.color);
    setNextBlock(newNextBlock);
    
    // CRITICAL: Create a fresh object for the spawn position
    // This ensures we're not using a reference that might be modified elsewhere
    const spawnPosition = {
      x: INITIAL_POSITION.x,
      y: INITIAL_POSITION.y,
      z: INITIAL_POSITION.z
    };
    
    console.log(`📍 Setting position to spawn point: ${JSON.stringify(spawnPosition)}`);
    
    // Force position to be at spawn point, regardless of previous position
    setPosition(spawnPosition);
    
    // Check if the spawn position is valid
    const isValid = isValidPosition(spawnPosition);
    console.log(`${isValid ? '✅ Valid' : '❌ Invalid'} spawn position for new block`);
    return isValid;
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION, isValidPosition]);

  return {
    initializeBlocks,
    spawnNextBlock
  };
}
