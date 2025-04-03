
import { useRef, useState } from 'react';
import { getRandomBlockPattern } from '../../components/BlockPatterns';

export function useGameController() {
  const [currentBlock, setCurrentBlock] = useState(getRandomBlockPattern());
  const [position, setPosition] = useState({ x: 4, y: 0, z: 4 });
  const [controlsEnabled, setControlsEnabled] = useState(true);

  const orbitControlsRef = useRef(null);

  const moveBlock = (direction) => {
    const newPosition = { ...position };
    
    switch (direction) {
      case 'left': newPosition.x -= 1; break;
      case 'right': newPosition.x += 1; break;
      case 'forward': newPosition.z -= 1; break;
      case 'backward': newPosition.z += 1; break;
      case 'down': newPosition.y += 1; break;
    }

    setPosition(newPosition);
    return true;
  };

  const dropBlock = () => {
    setCurrentBlock(getRandomBlockPattern());
    setPosition({ x: 4, y: 0, z: 4 });
    setControlsEnabled(true);
    return true;
  };

  return {
    currentBlock,
    position,
    controlsEnabled,
    orbitControlsRef,
    moveBlock,
    dropBlock,
    setCurrentBlock
  };
}
