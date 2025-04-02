
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BlockPattern } from './BlockPatterns';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position }) => {
  // Color mapping
  const getColor = (colorIndex: number) => {
    const colors = {
      1: new THREE.Color('#3b82f6'), // blue
      2: new THREE.Color('#ef4444'), // red
      3: new THREE.Color('#22c55e'), // green
      4: new THREE.Color('#a855f7'), // purple
      5: new THREE.Color('#eab308')  // yellow
    };
    return colors[colorIndex as keyof typeof colors] || new THREE.Color('gray');
  };

  // Get current block's color as THREE.Color
  const blockColor = useMemo(() => {
    const colorMap: Record<string, THREE.Color> = {
      'blue': new THREE.Color('#3b82f6'),
      'red': new THREE.Color('#ef4444'),
      'green': new THREE.Color('#22c55e'),
      'purple': new THREE.Color('#a855f7'),
      'yellow': new THREE.Color('#eab308')
    };
    return colorMap[currentBlock.color] || new THREE.Color('gray');
  }, [currentBlock.color]);

  // Render placed blocks from grid
  const renderPlacedBlocks = useMemo(() => {
    const blocks = [];
    if (!grid || grid.length === 0) return blocks;

    const gridSize = grid.length;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          if (grid[y][x][z] !== 0) {
            blocks.push(
              <mesh 
                key={`${x}-${y}-${z}`} 
                position={[x, y, z]} 
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.95, 0.95, 0.95]} />
                <meshStandardMaterial color={getColor(grid[y][x][z])} />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [grid]);

  // Render current falling block
  const renderCurrentBlock = useMemo(() => {
    const blocks = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          // Calculate absolute positions
          const posX = position.x + x;
          const posY = position.y;
          const posZ = position.z + y;
          
          // Skip rendering blocks that would be outside the grid
          if (posX < 0 || posX >= gridSize || posY < 0 || posY >= gridSize || posZ < 0 || posZ >= gridSize) {
            continue;
          }
          
          blocks.push(
            <mesh 
              key={`current-${y}-${x}`} 
              position={[posX, posY, posZ]} 
              castShadow
            >
              <boxGeometry args={[0.95, 0.95, 0.95]} />
              <meshStandardMaterial 
                color={blockColor} 
                transparent={true} 
                opacity={0.8} 
              />
            </mesh>
          );
        }
      }
    }
    
    return blocks;
  }, [currentBlock, position, blockColor, grid.length]);

  // Render grid boundaries
  const renderGridBoundaries = useMemo(() => {
    const gridSize = grid.length || 10;
    
    return (
      <mesh position={[gridSize/2 - 0.5, gridSize/2 - 0.5, gridSize/2 - 0.5]}>
        <boxGeometry args={[gridSize, gridSize, gridSize]} />
        <meshStandardMaterial 
          color="white" 
          transparent={true} 
          opacity={0.03} 
          wireframe={true} 
        />
      </mesh>
    );
  }, [grid]);

  // Render height limit indicator
  const renderHeightLimit = useMemo(() => {
    const gridSize = grid.length || 10;
    
    // Add directional indicators
    const renderAxis = () => {
      return (
        <group>
          {/* X-axis (red) */}
          <mesh position={[gridSize/2, -0.5, -0.5]}>
            <boxGeometry args={[gridSize, 0.1, 0.1]} />
            <meshStandardMaterial color="red" />
          </mesh>
          
          {/* Y-axis (green) */}
          <mesh position={[-0.5, gridSize/2, -0.5]}>
            <boxGeometry args={[0.1, gridSize, 0.1]} />
            <meshStandardMaterial color="green" />
          </mesh>
          
          {/* Z-axis (blue) */}
          <mesh position={[-0.5, -0.5, gridSize/2]}>
            <boxGeometry args={[0.1, 0.1, gridSize]} />
            <meshStandardMaterial color="blue" />
          </mesh>
        </group>
      );
    };
    
    return (
      <>
        <mesh position={[gridSize/2 - 0.5, 0, gridSize/2 - 0.5]}>
          <boxGeometry args={[gridSize, 0.1, gridSize]} />
          <meshStandardMaterial 
            color="#ff3333"
            transparent={true}
            opacity={0.1}
          />
        </mesh>
        {renderAxis()}
      </>
    );
  }, [grid]);

  return (
    <group>
      {renderPlacedBlocks}
      {renderCurrentBlock}
      {renderGridBoundaries}
      {renderHeightLimit}
      <gridHelper args={[10, 10]} position={[4.5, -0.5, 4.5]} />
    </group>
  );
};

export default Grid3D;
