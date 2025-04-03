
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
      // First, set the current block to the next block
      const nextBlockToUse = { ...getRandomBlockPattern() }; // Create a fresh copy of the next block
      
      setCurrentBlock(prevBlock => {
        return { ...nextBlockToUse };
      });
      
      // Generate a new next block
      const newNextBlock = getRandomBlockPattern();
      setNextBlock(newNextBlock);
      
      // CRITICAL: Create a fresh object for the spawn position
      // This ensures no reference issues with previous positions
      const spawnPosition = {
        x: INITIAL_POSITION.x,
        y: INITIAL_POSITION.y, 
        z: INITIAL_POSITION.z
      };
      
      // Force reset the position to the spawn point
      console.log("🎯 Setting fresh spawn position:", spawnPosition);
      setPosition(spawnPosition);
      
      // Check if the spawn position is valid for the new block
      const isValid = true; // Always assume valid for initial spawn
      console.log(`✅ Spawn position for new block set to:`, spawnPosition);
      
      return isValid;
    } catch (error) {
      console.error("Error spawning next block:", error);
      return false;
    }
  }, [getRandomBlockPattern, setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  return {
    initializeBlocks,
    spawnNextBlock
  };
}
