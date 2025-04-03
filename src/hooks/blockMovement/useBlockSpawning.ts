
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
    try {
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
    } catch (error) {
      console.error("Error initializing block patterns:", error);
      // Fallback block patterns
      setCurrentBlock({ shape: [[1]], color: 'blue' });
      setNextBlock({ shape: [[1]], color: 'red' });
      setPosition({...INITIAL_POSITION});
    }
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  // Spawn next block at starting position
  const spawnNextBlock = useCallback(() => {
    console.log("🔄 Spawning next block");
    try {
      // Store the next block that will become the current block
      let nextBlockToUse = null;
      
      // Update the current block with the next block that was previously queued
      setCurrentBlock(prevNextBlock => {
        nextBlockToUse = prevNextBlock;
        return prevNextBlock;
      });
      
      // Generate a new next block
      const newNextBlock = getRandomBlockPattern();
      setNextBlock(newNextBlock);
      
      // CRITICAL: Create a fresh object for the spawn position
      const spawnPosition = {
        x: INITIAL_POSITION.x,
        y: INITIAL_POSITION.y,
        z: INITIAL_POSITION.z
      };
      
      // Force the position to be at the spawn point
      setPosition(spawnPosition);
      
      // Check if the spawn position is valid for the new current block
      // We must manually check here rather than relying on the state that might not be updated yet
      const isValid = isValidPosition(spawnPosition);
      
      console.log(`${isValid ? '✅ Valid' : '❌ Invalid'} spawn position for new block`);
      return isValid;
    } catch (error) {
      console.error("Error spawning next block:", error);
      return false;
    }
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION, isValidPosition]);

  return {
    initializeBlocks,
    spawnNextBlock
  };
}
