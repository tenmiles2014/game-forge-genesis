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
  const VERTICAL_STACK_LIMIT = grid.length - 3; // Match the limit in Game3D

  // Function to find the landing position of the current block
  const getLandingPosition = useMemo(() => {
    let landingY = position.y;
    
    // Clone the current grid to check collisions
    const gridCopy = JSON.parse(JSON.stringify(grid));
    
    // Check each possible position below the current one
    while (landingY > 0) {
      let canMoveDown = true;
      
      // Check if the block would collide at the next position down
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            const nextY = landingY - 1;
            const gridX = position.x + x;
            const gridZ = position.z + y;
            
            // Check grid boundaries
            if (nextY < 0) {
              canMoveDown = false;
              break;
            }
            
            // Check collision with existing blocks
            if (
              gridX >= 0 && 
              gridX < grid.length && 
              nextY >= 0 && 
              nextY < grid.length && 
              gridZ >= 0 && 
              gridZ < grid.length
            ) {
              if (gridCopy[nextY][gridX][gridZ] !== 0) {
                canMoveDown = false;
                break;
              }
            }
          }
        }
        if (!canMoveDown) break;
      }
      
      if (!canMoveDown) break;
      landingY--;
    }
    
    return landingY;
  }, [position, currentBlock, grid]);

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
          <lineBasicMaterial attach="material" color="red" linewidth={3} />
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
          <lineBasicMaterial attach="material" color="blue" linewidth={3} />
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
          <lineBasicMaterial attach="material" color="green" linewidth={3} />
        </mesh>
        
        {/* Vertical stack limit warning line - added new */}
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={5}
              array={new Float32Array([
                0, VERTICAL_STACK_LIMIT, 0,
                gridSize, VERTICAL_STACK_LIMIT, 0,
                gridSize, VERTICAL_STACK_LIMIT, gridSize,
                0, VERTICAL_STACK_LIMIT, gridSize,
                0, VERTICAL_STACK_LIMIT, 0
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial attach="material" color="#ff0000" transparent={true} opacity={0.7} linewidth={3} />
        </mesh>
        
        {/* Floor grid plane matching the screenshot */}
        <Grid
          position={[gridSize/2 - 0.5, -0.01, gridSize/2 - 0.5]}
          args={[gridSize + 2, gridSize + 2]}
          cellSize={1}
          cellThickness={0.6} // Increased thickness
          cellColor="#4A9BF7" // Brighter color for better visibility
          sectionSize={gridSize/2}
          sectionThickness={1.0} // Increased thickness
          sectionColor="#4A9BF7"
          fadeStrength={1.5}
          infiniteGrid={false}
        />
        
        {/* Corner markers for the grid */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[gridSize - 1, 0, 0]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[0, 0, gridSize - 1]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        <mesh position={[gridSize - 1, 0, gridSize - 1]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial color="#4A9BF7" />
        </mesh>
        
        {/* Grid lines along the X-axis - made more obvious */}
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
        
        {/* Grid lines along the Z-axis - made more obvious */}
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
      </>
    );
  }, [grid, VERTICAL_STACK_LIMIT]);
  
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
  
  // Render the landing position prediction
  const renderLandingPreview = useMemo(() => {
    const blocks = [];
    const landingY = getLandingPosition;
    
    // Only render if the landing position is different from current position
    if (landingY !== position.y) {
      for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
          if (currentBlock.shape[y][x]) {
            blocks.push(
              <mesh 
                key={`landing-${x}-${y}`} 
                position={[position.x + x, landingY, position.z + y]}
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial 
                  color={currentBlock.color} 
                  transparent={true} 
                  opacity={0.4} 
                  wireframe={false}
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [currentBlock, position, getLandingPosition]);
  
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
      {renderLandingPreview}
      
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
