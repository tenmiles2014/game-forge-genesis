
import React, { useMemo } from 'react';
import { BlockPattern } from './BlockPatterns';
import * as THREE from 'three';
import { Grid } from '@react-three/drei';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, linesCleared }) => {
  const renderGridBoundaries = useMemo(() => {
    const gridSize = grid.length || 10;
    
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
              array={new Float32Array([0, 0, 0, grid.length, 0, 0])}
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
              array={new Float32Array([0, 0, 0, 0, grid.length, 0])}
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
              array={new Float32Array([0, 0, 0, 0, 0, grid.length])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="green" />
        </mesh>
        
        {/* Floor grid plane matching the screenshot */}
        <Grid
          position={[gridSize/2 - 0.5, -0.01, gridSize/2 - 0.5]}
          args={[gridSize + 2, gridSize + 2]}
          cellSize={1}
          cellThickness={0.3}
          cellColor="#2a3040"
          sectionSize={gridSize/2}
          sectionThickness={0.5}
          sectionColor="#4A9BF7"
          fadeStrength={1.5}
          infiniteGrid={false}
        />
        
        {/* Corner markers for the grid */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[gridSize - 1, 0, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[0, 0, gridSize - 1]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[gridSize - 1, 0, gridSize - 1]}>
          <boxGeometry args={[0.5, 0.1, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
      </>
    );
  }, [grid]);
  
  // Render the blocks in the grid
  const renderGridBlocks = useMemo(() => {
    return grid.flatMap((layer, y) =>
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
    ).filter(Boolean);
  }, [grid]);
  
  // Render the current active block
  const renderCurrentBlock = useMemo(() => {
    const blocks = [];
    
    for (let y = 0; y < currentBlock.shape.length; y++) {
      for (let x = 0; x < currentBlock.shape[y].length; x++) {
        if (currentBlock.shape[y][x]) {
          blocks.push(
            <mesh 
              key={`current-${x}-${y}`} 
              position={[position.x + x, position.y, position.z + y]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={currentBlock.color} />
            </mesh>
          );
        }
      }
    }
    
    return blocks;
  }, [currentBlock, position]);
  
  // Flash effect when lines are cleared
  const [flashEffect, setFlashEffect] = React.useState(false);
  const [lastLinesCleared, setLastLinesCleared] = React.useState(0);
  
  React.useEffect(() => {
    if (linesCleared > lastLinesCleared) {
      setFlashEffect(true);
      setLastLinesCleared(linesCleared);
      
      // Turn off the flash effect after a delay
      const timer = setTimeout(() => {
        setFlashEffect(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [linesCleared, lastLinesCleared]);
  
  return (
    <>
      {renderGridBoundaries}
      {renderGridBlocks}
      {renderCurrentBlock}
      
      {/* Flash light effect when lines are cleared */}
      {flashEffect && (
        <pointLight 
          position={[5, 5, 5]} 
          intensity={5} 
          color="#ffffff" 
          distance={20}
        />
      )}
    </>
  );
};

// Helper function to get color from index
const getColorFromIndex = (index: number): string => {
  const colors: Record<number, string> = {
    1: 'blue',
    2: 'red',
    3: 'green',
    4: 'purple',
    5: 'yellow',
    0: 'gray'
  };
  return colors[index] || 'gray';
};

export default Grid3D;
