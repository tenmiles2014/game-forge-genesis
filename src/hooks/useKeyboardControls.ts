
import { useEffect } from 'react';

interface KeyboardControlsProps {
  moveBlock: (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => boolean;
  rotateBlock: (axis: 'x' | 'y' | 'z') => number[][] | null;
  dropBlock: () => void;
  controlsEnabled: boolean;
  gamePaused: boolean;
  setCurrentBlock: (block: any) => void;
  currentBlock: any;
}

export function useKeyboardControls({
  moveBlock,
  rotateBlock, 
  dropBlock,
  controlsEnabled,
  gamePaused,
  setCurrentBlock,
  currentBlock
}: KeyboardControlsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!controlsEnabled || gamePaused) {
        console.log("Controls disabled or game paused - not processing key events");
        return;
      }
      
      console.log(`Key pressed: ${event.key}, controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
      
      switch (event.key) {
        case 'ArrowLeft':
          moveBlock('left');
          break;
        case 'ArrowRight':
          moveBlock('right');
          break;
        case 'ArrowUp':
          moveBlock('forward');
          break;
        case 'ArrowDown':
          moveBlock('backward');
          break;
        case ' ':  // Space key
          dropBlock();
          break;
        case 'z':  // Rotate around z-axis
          const rotatedZ = rotateBlock('z');
          if (rotatedZ) {
            setCurrentBlock({
              ...currentBlock,
              shape: rotatedZ
            });
          }
          break;
        case 'x':  // Rotate around x-axis
          const rotatedX = rotateBlock('x');
          if (rotatedX) {
            setCurrentBlock({
              ...currentBlock,
              shape: rotatedX
            });
          }
          break;
        case 's':  // Drop block immediately
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
  }, [moveBlock, rotateBlock, dropBlock, controlsEnabled, gamePaused, currentBlock, setCurrentBlock]);
}
