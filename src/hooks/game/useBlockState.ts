
import { useState } from 'react';
import { BlockPattern, getRandomBlockPattern } from '../../components/BlockPatterns';

// Constants
const INITIAL_BLOCK_POSITION = { row: 0, col: 4 }; // col: Math.floor(10 / 2) - 1

/**
 * Hook for managing block state and operations
 */
export function useBlockState() {
  const [currentBlock, setCurrentBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [nextBlock, setNextBlock] = useState<BlockPattern>(getRandomBlockPattern());
  const [position, setPosition] = useState(INITIAL_BLOCK_POSITION);

  const resetBlockPosition = () => {
    setPosition(INITIAL_BLOCK_POSITION);
  };

  return {
    currentBlock,
    setCurrentBlock,
    nextBlock,
    setNextBlock,
    position,
    setPosition,
    resetBlockPosition,
    INITIAL_BLOCK_POSITION
  };
}
