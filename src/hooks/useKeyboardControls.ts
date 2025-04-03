
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
    console.log(`Keyboard controls mounted - controlsEnabled: ${controlsEnabled}, gamePaused: ${gamePaused}`);
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if game is active (not paused and controls enabled)
      if (gamePaused) {
        console.log(`Game paused - not processing key events. gamePaused: ${gamePaused}`);
        return;
      }
      
      // Explicitly confirm controls are enabled
      if (!controlsEnabled) {
        console.log(`Controls disabled - not processing key events. controlsEnabled: ${controlsEnabled}`);
        return;
      }
      
      console.log(`Processing key press: ${event.key}`);
      
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
        case 's':  // Move block down
          console.log("Moving block down");
          moveBlock('down'); 
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      console.log("Keyboard controls unmounted");
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveBlock, rotateBlock, dropBlock, controlsEnabled, gamePaused, currentBlock, setCurrentBlock]);
}
