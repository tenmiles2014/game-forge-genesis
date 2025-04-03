
import { useState } from 'react';

/**
 * Hook for managing game status states
 */
export function useGameStatus() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gamePaused, setGamePaused] = useState(true);
  const [linesCleared, setLinesCleared] = useState(0);

  return {
    score,
    setScore,
    gameOver,
    setGameOver,
    gamePaused,
    setGamePaused,
    linesCleared,
    setLinesCleared
  };
}
