
import React from 'react';
import { getColorFromIndex } from '../utils/colorUtils';

interface GridBlocksProps {
  grid: number[][][];
}

const GridBlocks: React.FC<GridBlocksProps> = ({ grid }) => {
  // Safety check
  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    return null;
  }
  
  return (
    <>
      {grid.flatMap((layer, y) =>
        layer.flatMap((row, x) =>
          row.map((cell, z) => {
            if (cell !== 0) {
              const color = getColorFromIndex(cell);
              return (
                <mesh key={`grid-${x}-${y}-${z}`} position={[x, y, z]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color={color} />
                </mesh>
              );
            }
            return null;
          })
        )
      ).filter(Boolean)}
    </>
  );
};

export default GridBlocks;
