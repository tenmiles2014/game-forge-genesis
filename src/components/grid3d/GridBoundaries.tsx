
import React from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

interface GridBoundariesProps {
  gridSize: number;
}

const GridBoundaries: React.FC<GridBoundariesProps> = ({ gridSize }) => {
  // Default vertical stack limit if not provided
  const verticalStackLimit = Math.floor(gridSize * 0.8);
  
  return (
    <>
      {/* Floor grid plane - positioned exactly at y=-0.5 */}
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
      
      {/* Corner markers for the grid - at y=-0.5 to match grid height */}
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

      {/* Add subtle edge guidelines to make the grid boundaries visible */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, gridSize - 1, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
      </mesh>

      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, gridSize - 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
      </mesh>

      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([gridSize - 1, 0, 0, gridSize - 1, 0, gridSize - 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
      </mesh>

      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, gridSize - 1, gridSize - 1, 0, gridSize - 1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
      </mesh>
    </>
  );
};

export default GridBoundaries;
