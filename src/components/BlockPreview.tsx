
import React from 'react';
import { BlockPattern } from './BlockPatterns';
import * as THREE from 'three';

interface BlockPreviewProps {
  block: BlockPattern;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block }) => {
  // Get color as THREE.Color
  const getBlockColor = () => {
    const colorMap: Record<string, THREE.Color> = {
      'blue': new THREE.Color('#3b82f6'),
      'red': new THREE.Color('#ef4444'),
      'green': new THREE.Color('#22c55e'),
      'purple': new THREE.Color('#a855f7'),
      'yellow': new THREE.Color('#eab308'),
      'cyan': new THREE.Color('#06b6d4'),
      'orange': new THREE.Color('#f97316'),
    };
    return colorMap[block.color] || new THREE.Color('gray');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Create a cube for each cell in the block pattern */}
      {block.shape.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          cell === 1 && (
            <mesh 
              key={`${rowIndex}-${colIndex}`} 
              position={[colIndex - (row.length / 2) + 0.5, 0, rowIndex - (block.shape.length / 2) + 0.5]}
            >
              <boxGeometry args={[0.9, 0.9, 0.9]} />
              <meshStandardMaterial color={getBlockColor()} />
            </mesh>
          )
        ))
      ))}
      {/* Add some lights */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
    </group>
  );
};

export default BlockPreview;
