
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern } from '../../components/BlockPatterns';

interface ResetGameActionProps {
  setGrid: (grid: number[][][] | ((prevGrid: number[][][]) => number[][][])) => void;
  setScore: (score: number) => void;
  setCurrentBlock: (block: BlockPattern) => void;
  setNextBlock: (block: BlockPattern) => void;
  setPosition: (position: { x: number; y: number; z: number }) => void;
  setGameOver: (gameOver: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  setLevel: (level: number) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  setLinesCleared: (linesCleared: (prev: number) => number) => void;
  getRandomBlockPattern: () => BlockPattern;
  INITIAL_POSITION: { x: number; y: number; z: number };
  initializeGrid?: () => number[][][];
}

export function useResetGameAction({
  setGrid,
  setScore,
  setCurrentBlock,
  setNextBlock,
  setPosition,
  setGameOver,
  setControlsEnabled,
  setTimerActive,
  setGamePaused,
  setLevel,
  gravityTimerRef,
  setLinesCleared,
  getRandomBlockPattern,
  INITIAL_POSITION,
  initializeGrid
}: ResetGameActionProps) {
  const resetGame = useCallback(() => {
    if (gravityTimerRef.current) {
      clearInterval(gravityTimerRef.current);
      gravityTimerRef.current = null;
    }
    
    const createNewGrid = (prevGrid: number[][][]) => {
      const size = prevGrid.length || 10;
      const newGrid: number[][][] = [];
      
      for (let y = 0; y < size; y++) {
        const layer: number[][] = [];
        for (let x = 0; x < size; x++) {
          const row: number[] = [];
          for (let z = 0; z < size; z++) {
            row.push(0);
          }
          layer.push(row);
        }
        newGrid.push(layer);
      }
      
      return newGrid;
    };
    
    if (initializeGrid) {
      setGrid(initializeGrid());
    } else {
      setGrid(createNewGrid);
    }
    
    try {
      const newCurrentBlock = getRandomBlockPattern();
      const newNextBlock = getRandomBlockPattern();
      
      console.log("Reset Game - New blocks generated:", { 
        current: newCurrentBlock?.color, 
        next: newNextBlock?.color 
      });
      
      setCurrentBlock(newCurrentBlock);
      setNextBlock(newNextBlock);
    } catch (error) {
      console.error("Error generating block patterns:", error);
      setCurrentBlock({ shape: [[1]], color: 'blue' });
      setNextBlock({ shape: [[1]], color: 'red' });
    }
    
    setScore(0);
    setLinesCleared(() => 0);
    setPosition({...INITIAL_POSITION});
    setGameOver(false);
    setGamePaused(true);
    setTimerActive(false);
    setControlsEnabled(false);
    setLevel(1);
    
    toast({
      title: "Game Reset",
      description: "Ready for a new challenge!",
    });
  }, [
    gravityTimerRef,
    setGrid,
    setScore,
    setCurrentBlock,
    setNextBlock,
    setPosition,
    setGameOver,
    setGamePaused,
    setTimerActive,
    setControlsEnabled,
    setLevel,
    setLinesCleared,
    getRandomBlockPattern,
    INITIAL_POSITION,
    initializeGrid
  ]);

  return { resetGame };
}
