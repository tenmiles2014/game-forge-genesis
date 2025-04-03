
import React from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

interface GridBoundariesProps {
  gridSize: number;
}

const GridBoundaries: React.FC<GridBoundariesProps> = ({ gridSize }) => {
  const halfGridSize = gridSize / 2;

  return (
    <>
      {/* Floor grid */}
      <Grid
        position={[halfGridSize - 0.5, -0.5, halfGridSize - 0.5]}
        args={[gridSize, gridSize]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#4A9BF7"
        sectionSize={halfGridSize}
        sectionThickness={1.0}
        sectionColor="#4A9BF7"
        fadeStrength={1.5}
        infiniteGrid={false}
      />
      
      {/* Corner markers */}
      {[
        [0, 0],
        [gridSize - 1, 0],
        [0, gridSize - 1],
        [gridSize - 1, gridSize - 1]
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, -0.5, z]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
      ))}

      {/* Visible bounding box for the play area */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(gridSize, gridSize, gridSize)]} />
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.5} transparent />
      </lineSegments>
      
      {/* Height indicator lines */}
      {[0, 2, 4, 6, 8].map((height) => (
        <React.Fragment key={`height-${height}`}>
          {[
            [0, height, 0],
            [gridSize-1, height, 0],
            [0, height, gridSize-1],
            [gridSize-1, height, gridSize-1]
          ].map(([x, y, z], index) => (
            <mesh key={index} position={[x, y, z]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
            </mesh>
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

export default GridBoundaries;

