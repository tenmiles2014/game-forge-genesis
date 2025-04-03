
import React from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

interface GridBoundariesProps {
  gridSize: number;
}

const GridBoundaries: React.FC<GridBoundariesProps> = ({ gridSize }) => {
  return (
    <>
      {/* Floor grid */}
      <Grid
        position={[gridSize/2 - 0.5, -0.5, gridSize/2 - 0.5]}
        args={[gridSize, gridSize]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#4A9BF7"
        sectionSize={gridSize/2}
        sectionThickness={1.0}
        sectionColor="#4A9BF7"
        fadeStrength={1.5}
        infiniteGrid={false}
      />
      
      {/* Corner markers */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshBasicMaterial color="#4A9BF7" />
      </mesh>
      
      <mesh position={[gridSize - 1, -0.5, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshBasicMaterial color="#4A9BF7" />
      </mesh>
      
      <mesh position={[0, -0.5, gridSize - 1]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshBasicMaterial color="#4A9BF7" />
      </mesh>
      
      <mesh position={[gridSize - 1, -0.5, gridSize - 1]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshBasicMaterial color="#4A9BF7" />
      </mesh>

      {/* Edge guidelines */}
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(gridSize, gridSize, gridSize)]} />
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.3} transparent />
      </lineSegments>
    </>
  );
};

export default GridBoundaries;
