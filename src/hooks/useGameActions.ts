
import { useCallback } from 'react';
import { toast } from "@/components/ui/use-toast";
import { BlockPattern } from '../components/BlockPatterns';

interface GameActionsProps {
  grid: number[][][];
  setGrid: (grid: number[][][]) => void;
  score: number;
  setScore: (score: (prev: number) => number) => void;
  currentBlock: BlockPattern;
  setCurrentBlock: (block: BlockPattern) => void;
  nextBlock: BlockPattern;
  setNextBlock: (block: BlockPattern) => void;
  position: { x: number; y: number; z: number };
  setPosition: (pos: { x: number; y: number; z: number }) => void;
  setGameOver: (over: boolean) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setTimerActive: (active: boolean) => void;
  setGamePaused: (paused: boolean) => void;
  level: number;
  setLevel: (level: number) => void;
  gravityTimerRef: React.MutableRefObject<number | null>;
  setLinesCleared: (lines: (prev: number) => number) => void;
  clearCompleteLayers: (grid: number[][][]) => number;
  checkIfStackedBlocks: (grid: number[][][]) => boolean;
  checkVerticalStackLimit: (grid: number[][][]) => boolean;
  isValidPosition: (newPosition: { x: number; y: number; z: number }) => boolean;
  getRandomBlockPattern: () => BlockPattern;
  getColorIndex: (color: string) => number;
  INITIAL_POSITION: { x: number; y: number; z: number };
  MAX_LEVEL: number;
  gamePaused: boolean;
}

export function useGameActions({
  grid,
  setGrid,
  score,
  setScore,
  currentBlock,
  setCurrentBlock,
  nextBlock,
  setNextBlock,
  position,
  setPosition,
  setGameOver,
  setControlsEnabled,
  setTimerActive,
  setGamePaused,
  level,
  setLevel,
  gravityTimerRef,
  setLinesCleared,
  clearCompleteLayers,
  checkIfStackedBlocks,
  checkVerticalStackLimit,
  isValidPosition,
  getRandomBlockPattern,
  getColorIndex,
  INITIAL_POSITION,
  MAX_LEVEL,
  gamePaused
}: GameActionsProps) {
  const resetGame = useCallback(() => {
    console.log("🔄 Resetting Game");
    
    try {
      // Clear gravity timer if exists
      if (gravityTimerRef.current) {
        clearTimeout(gravityTimerRef.current);
      }

      // Reset all game states
      setGrid([]); // This should trigger grid initialization
      setScore(() => 0);
      setCurrentBlock(getRandomBlockPattern());
      setNextBlock(getRandomBlockPattern());
      setPosition(INITIAL_POSITION);
      setGameOver(false);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);
      setLinesCleared(() => 0);
      setLevel(1);

      toast({
        title: "Game Reset 🔁",
        description: "All game states have been reset"
      });
    } catch (error) {
      console.error("❌ Game Reset Error:", error);
      toast({
        title: "Reset Failed",
        description: "Unable to reset game. Try refreshing.",
        variant: "destructive"
      });
    }
  }, [
    gravityTimerRef, 
    setGrid, 
    setScore, 
    setCurrentBlock, 
    setNextBlock, 
    setPosition, 
    setGameOver, 
    setControlsEnabled, 
    setTimerActive, 
    setGamePaused, 
    setLinesCleared, 
    setLevel,
    getRandomBlockPattern,
    INITIAL_POSITION
  ]);

  const handleTimeUp = useCallback(() => {
    console.log("⏰ Time's Up!");
    
    try {
      setGameOver(true);
      setControlsEnabled(false);
      setTimerActive(false);
      setGamePaused(true);

      toast({
        title: "Time's Up! 🕒",
        description: `Game Over. Final Score: ${score}`,
        variant: "default"
      });
    } catch (error) {
      console.error("❌ Time Up Handler Error:", error);
    }
  }, [score, setGameOver, setControlsEnabled, setTimerActive, setGamePaused]);

  const toggleGamePause = useCallback(() => {
    console.log(`🎮 Toggling Pause: Current State = ${gamePaused}`);
    
    try {
      setGamePaused(prev => {
        const newPauseState = !prev;
        
        // Adjust controls based on pause state
        setControlsEnabled(!newPauseState);
        
        toast({
          title: newPauseState ? "Game Paused ⏸️" : "Game Resumed ▶️",
          description: newPauseState 
            ? "Game is paused. Click 'Start' to continue" 
            : "Back to the game!"
        });
        
        return newPauseState;
      });
    } catch (error) {
      console.error("❌ Toggle Pause Error:", error);
    }
  }, [gamePaused, setGamePaused, setControlsEnabled]);

  return {
    resetGame, 
    handleTimeUp, 
    toggleGamePause,
    startGame: () => {
      console.log("🚀 Starting Game");
      
      try {
        setControlsEnabled(true);
        setGamePaused(false);
        setTimerActive(true);

        toast({
          title: "Game Started 🎮",
          description: "Use arrow keys to move and Z/X to rotate blocks"
        });
      } catch (error) {
        console.error("❌ Start Game Error:", error);
      }
    }
  };
}
