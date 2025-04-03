
import React from 'react';
import { BlockPattern } from '../BlockPatterns';

interface ActiveBlockProps {
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
}

const ActiveBlock: React.FC<ActiveBlockProps> = ({ currentBlock, position }) => {
  // Safety check
  if (!currentBlock || !currentBlock.shape || !position) {
    return null;
  }
  
  return (
    <>
      {currentBlock.shape.flatMap((row, y) =>
        row.map((cell, x) => {
          if (cell) {
            return (
              <mesh 
                key={`current-${x}-${y}`} 
                position={[position.x + x, position.y - y, position.z + 0]} // Updated: y is subtracted to display correctly
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={currentBlock.color} />
              </mesh>
            );
          }
          return null;
        })
      ).filter(Boolean)}
    </>
  );
};

export default ActiveBlock;
