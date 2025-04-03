
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
          console.log("Moving block left");
          moveBlock('left');
          break;
        case 'ArrowRight':
          console.log("Moving block right");
          moveBlock('right');
          break;
        case 'ArrowUp':
          console.log("Moving block forward");
          moveBlock('forward');
          break;
        case 'ArrowDown':
          console.log("Moving block backward");
          moveBlock('backward');
          break;
        case ' ':  // Space key
          console.log("Dropping block");
          dropBlock();
          break;
        case 'z':  // Rotate around z-axis
          console.log("Rotating block around z-axis");
          const rotatedZ = rotateBlock('z');
          if (rotatedZ) {
            setCurrentBlock({
              ...currentBlock,
              shape: rotatedZ
            });
          }
          break;
        case 'x':  // Rotate around x-axis
          console.log("Rotating block around x-axis");
          const rotatedX = rotateBlock('x');
          if (rotatedX) {
            setCurrentBlock({
              ...currentBlock,
              shape: rotatedX
            });
          }
          break;
        case 's':  // Drop block immediately
          console.log("Moving block down");
          moveBlock('down'); 
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    console.log(`Keyboard controls mounted - controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      console.log("Keyboard controls unmounted");
    };
  }, [moveBlock, rotateBlock, dropBlock, controlsEnabled, gamePaused, currentBlock, setCurrentBlock]);
}
