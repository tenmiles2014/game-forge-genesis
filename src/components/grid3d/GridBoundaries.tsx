
import React from 'react';
import { Grid } from '@react-three/drei';
import * as THREE from 'three';

interface GridBoundariesProps {
  gridSize: number;
  verticalStackLimit: number;
}

const GridBoundaries: React.FC<GridBoundariesProps> = ({ gridSize, verticalStackLimit }) => {
  return (
    <>
      {/* Main grid boundary box */}
      <mesh position={[gridSize/2 - 0.5, gridSize/2 - 0.5, gridSize/2 - 0.5]}>
        <boxGeometry args={[gridSize, gridSize, gridSize]} />
        <meshStandardMaterial 
          color="white" 
          transparent={true} 
          opacity={0.02}
          wireframe={true} 
        />
      </mesh>
      
      {/* X-axis line */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, gridSize, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="red" />
      </mesh>
      
      {/* Y-axis line */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, gridSize, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="blue" />
      </mesh>
      
      {/* Z-axis line */}
      <mesh>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, gridSize])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="green" />
      </mesh>
      
      {/* Grid lines along the X-axis */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <mesh key={`grid-x-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([i, 0, 0, i, 0, gridSize])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
        </mesh>
      ))}
      
      {/* Grid lines along the Z-axis */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <mesh key={`grid-z-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, i, gridSize, 0, i])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#4A9BF7" opacity={0.7} transparent={true} />
        </mesh>
      ))}
      
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
      
      {/* Corner markers for the grid - now at y=-0.5 to match grid height */}
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
    </>
  );
};

export default GridBoundaries;
