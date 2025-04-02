import React, { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { BlockPattern } from './BlockPatterns';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, linesCleared }) => {
  const [flashEffect, setFlashEffect] = useState(false);
  const previousLinesClearedRef = React.useRef(linesCleared);

  useEffect(() => {
    if (linesCleared > previousLinesClearedRef.current) {
      setFlashEffect(true);
      const timer = setTimeout(() => {
        setFlashEffect(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    previousLinesClearedRef.current = linesCleared;
  }, [linesCleared]);

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

  const ghostPosition = useMemo(() => {
    let lowestValidY = position.y;
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    while (lowestValidY > 0) {
      let collision = false;
      
      for (let y = 0; y < pattern.length && !collision; y++) {
        for (let x = 0; x < pattern[y].length && !collision; x++) {
          if (pattern[y][x]) {
            const posX = position.x + x;
            const posY = lowestValidY - 1;
            const posZ = position.z + y;
            
            if (
              posY < 0 || 
              (posX >= 0 && posX < gridSize && 
               posY >= 0 && posY < gridSize && 
               posZ >= 0 && posZ < gridSize && 
               grid[posY][posX][posZ] !== 0)
            ) {
              collision = true;
            }
          }
        }
      }
      
      if (collision) break;
      lowestValidY--;
    }
    
    return { x: position.x, y: lowestValidY, z: position.z };
  }, [grid, currentBlock.shape, position]);

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

  const renderGhostBlock = useMemo(() => {
    const blocks = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    if (ghostPosition.y < position.y) {
      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x]) {
            const posX = ghostPosition.x + x;
            const posY = ghostPosition.y;
            const posZ = ghostPosition.z + y;
            
            if (posX < 0 || posX >= gridSize || posY < 0 || posY >= gridSize || posZ < 0 || posZ >= gridSize) {
              continue;
            }
            
            blocks.push(
              <mesh 
                key={`ghost-${y}-${x}`} 
                position={[posX, posY, posZ]} 
                receiveShadow
              >
                <boxGeometry args={[0.95, 0.95, 0.95]} />
                <meshStandardMaterial 
                  color={blockColor} 
                  transparent={true} 
                  opacity={0.2} 
                  wireframe={true} 
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [currentBlock.shape, ghostPosition, position.y, blockColor, grid.length]);

  const renderCurrentBlock = useMemo(() => {
    const blocks = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          const posX = position.x + x;
          const posY = position.y;
          const posZ = position.z + y;
          
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

  const renderHeightLimit = useMemo(() => {
    const gridSize = grid.length || 10;
    
    return (
      <mesh position={[gridSize/2 - 0.5, gridSize - 1, gridSize/2 - 0.5]}>
        <boxGeometry args={[gridSize, 0.1, gridSize]} />
        <meshStandardMaterial 
          color="#F2FCE2" 
          transparent={true}
          opacity={0.2}
        />
      </mesh>
    );
  }, [grid]);

  const renderFlashEffect = useMemo(() => {
    if (!flashEffect) return null;
    
    const gridSize = grid.length || 10;
    
    return (
      <pointLight
        position={[gridSize/2 - 0.5, gridSize/2, gridSize/2 - 0.5]}
        intensity={2}
        distance={20}
        decay={2}
        color="#FFFFFF"
      >
        <mesh>
          <sphereGeometry args={[0.5, 16, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.7} />
        </mesh>
      </pointLight>
    );
  }, [flashEffect, grid]);

  return (
    <group>
      {renderPlacedBlocks}
      {renderCurrentBlock}
      {renderGhostBlock}
      {renderGridBoundaries}
      {renderHeightLimit}
      {renderFlashEffect}
      <gridHelper args={[10, 10]} position={[4.5, -0.5, 4.5]} />
      <ambientLight intensity={0.5} />
    </group>
  );
};

export default Grid3D;
