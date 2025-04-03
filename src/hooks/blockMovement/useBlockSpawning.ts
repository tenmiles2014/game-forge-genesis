
import { useCallback } from 'react';
import { getRandomBlockPattern } from '../../components/BlockPatterns';

export function useBlockSpawning({
  setCurrentBlock,
  setNextBlock,
  setPosition,
  INITIAL_POSITION,
  isValidPosition
}) {
  const initializeBlocks = useCallback(() => {
    console.log("🚀 Initializing Blocks");
    const initialBlock = getRandomBlockPattern();
    const nextBlock = getRandomBlockPattern();

    console.log("Initial Block:", initialBlock);
    console.log("Next Block:", nextBlock);
    console.log("Initial Position:", INITIAL_POSITION);

    setCurrentBlock(initialBlock);
    setNextBlock(nextBlock);
    setPosition(INITIAL_POSITION);
  }, [setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  const spawnNextBlock = useCallback(() => {
    console.log("🔄 Spawning Next Block");
    
    const nextBlockToUse = getRandomBlockPattern();
    const nextNextBlock = getRandomBlockPattern();

    console.log("New Current Block:", nextBlockToUse);
    console.log("New Next Block:", nextNextBlock);
    console.log("Spawn Position:", INITIAL_POSITION);

    setCurrentBlock(nextBlockToUse);
    setNextBlock(nextNextBlock);
    setPosition(INITIAL_POSITION);

    return true;
  }, [setCurrentBlock, setNextBlock, setPosition, INITIAL_POSITION]);

  return {
    initializeBlocks,
    spawnNextBlock
  };
}
