
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern, getRandomBlockPattern } from '../../components/BlockPatterns';
import { GridCellState } from '../../components/GameGrid';

/**
 * Hook for game control actions like reset and pause
 */
export function useGameActions({
  setGrid,
  setScore,
  setCurrentBlock,
  setNextBlock,
  resetBlockPosition,
  setGameOver,
  setGamePaused,
  setLinesCleared,
  initializeGrid,
  score
}: {
  setGrid: (grid: GridCellState[][]) => void;
  setScore: (score: number) => void;
  setCurrentBlock: (block: BlockPattern) => void;
  setNextBlock: (block: BlockPattern) => void;
  resetBlockPosition: () => void;
  setGameOver: (gameOver: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  setLinesCleared: (lines: number) => void;
  initializeGrid: () => GridCellState[][];
  score: number;
}) {
  // Reset game
  const resetGame = useCallback(() => {
    setGrid(initializeGrid());
    setScore(0);
    setLinesCleared(0);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
    resetBlockPosition();
    setGameOver(false);
    setGamePaused(true);
  }, [initializeGrid, setGrid, setScore, setCurrentBlock, setNextBlock, resetBlockPosition, setGameOver, setGamePaused, setLinesCleared]);
  
  // Toggle pause/resume game
  const togglePause = useCallback(() => {
    setGamePaused(prev => !prev);
  }, [setGamePaused]);

  return {
    resetGame,
    togglePause
  };
}
