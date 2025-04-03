
import { useEffect } from 'react';

interface GameKeyboardControlsProps {
  moveBlock: (direction: 'left' | 'right' | 'down') => void;
  rotateBlock: () => void;
  dropBlock: () => void;
  gameOver: boolean;
  gamePaused: boolean;
}

export const useGameKeyboardControls = ({
  moveBlock,
  rotateBlock,
  dropBlock,
  gameOver,
  gamePaused
}: GameKeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver || gamePaused) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          moveBlock('left');
          break;
        case 'ArrowRight':
          moveBlock('right');
          break;
        case 'ArrowDown':
          moveBlock('down');
          break;
        case 'ArrowUp':
          rotateBlock();
          break;
        case ' ':  // Space key
          dropBlock();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveBlock, rotateBlock, dropBlock, gameOver, gamePaused]);
};
