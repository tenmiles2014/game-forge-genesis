import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BlockPattern } from './BlockPatterns';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  highlightedLayers?: {y: number, type: string, index: number}[];
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, highlightedLayers = [] }) => {
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

  // Calculate ghost position (where block will land)
  const ghostPosition = useMemo(() => {
    let lowestValidY = position.y;
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    // Loop downward until we find a collision or hit the bottom
    while (lowestValidY > 0) {
      let collision = false;
      
      for (let y = 0; y < pattern.length && !collision; y++) {
        for (let x = 0; x < pattern[y].length && !collision; x++) {
          if (pattern[y][x]) {
            const posX = position.x + x;
            const posY = lowestValidY - 1;
            const posZ = position.z + y;
            
            // Check if we'd hit the bottom or another block
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

  // Check if a position is within a highlighted layer
  const isInHighlightedLayer = (x: number, y: number, z: number) => {
    for (const layer of highlightedLayers) {
      if (layer.type === 'horizontalRow' && y === layer.y && z === layer.index) {
        return true;
      } else if (layer.type === 'horizontalColumn' && y === layer.y && x === layer.index) {
        return true;
      } else if (layer.type === 'verticalColumn' && x === layer.index && z === layer.y) {
        return true;
      } else if (layer.type === 'fullLayer' && y === layer.y) {
        return true;
      }
    }
    return false;
  };

  // Render placed blocks from grid
  const renderPlacedBlocks = useMemo(() => {
    const blocks = [];
    if (!grid || grid.length === 0) return blocks;

    const gridSize = grid.length;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          if (grid[y][x][z] !== 0) {
            const isHighlighted = isInHighlightedLayer(x, y, z);
            const blockColor = getColor(grid[y][x][z]);
            
            blocks.push(
              <mesh 
                key={`${x}-${y}-${z}`} 
                position={[x, y, z]} 
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.95, 0.95, 0.95]} />
                <meshStandardMaterial 
                  color={isHighlighted ? 'white' : blockColor} 
                  emissive={isHighlighted ? blockColor : undefined}
                  emissiveIntensity={isHighlighted ? 0.6 : 0}
                  transparent={isHighlighted}
                  opacity={isHighlighted ? 0.9 : 1}
                />
                {isHighlighted && (
                  <mesh>
                    <boxGeometry args={[1.05, 1.05, 1.05]} />
                    <meshBasicMaterial 
                      color="white" 
                      transparent={true} 
                      opacity={0.3} 
                      wireframe={true}
                    />
                  </mesh>
                )}
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [grid, highlightedLayers]);

  // Render ghost block (prediction)
  const renderGhostBlock = useMemo(() => {
    const blocks = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    // Enhanced ghost block rendering
    if (ghostPosition.y < position.y) {
      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x]) {
            const posX = ghostPosition.x + x;
            const posY = ghostPosition.y;
            const posZ = ghostPosition.z + y;
            
            // Skip rendering blocks that would be outside the grid
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
                  color="#F97316"  // Bright Orange for high visibility
                  transparent={true} 
                  opacity={0.3}    // Slightly more transparent
                  wireframe={true}
                  wireframeLinewidth={2}  // Increased line thickness
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [currentBlock.shape, ghostPosition, position.y, grid.length]);

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

  // Render prediction lines between current block and ghost block
  const renderPredictionLines = useMemo(() => {
    const lines = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    // Only render if the ghost is lower than the current position
    if (ghostPosition.y < position.y) {
      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x]) {
            const currentPosX = position.x + x;
            const currentPosY = position.y;
            const currentPosZ = position.z + y;
            
            const ghostPosX = ghostPosition.x + x;
            const ghostPosY = ghostPosition.y;
            const ghostPosZ = ghostPosition.z + y;
            
            // Skip rendering lines for blocks that would be outside the grid
            if (
              currentPosX < 0 || currentPosX >= gridSize || 
              currentPosY < 0 || currentPosY >= gridSize || 
              currentPosZ < 0 || currentPosZ >= gridSize ||
              ghostPosX < 0 || ghostPosX >= gridSize || 
              ghostPosY < 0 || ghostPosY >= gridSize || 
              ghostPosZ < 0 || ghostPosZ >= gridSize
            ) {
              continue;
            }
            
            // Create line manually using mesh and geometry
            const lineColor = new THREE.Color(blockColor);
            
            // Calculate the midpoint and length for the cylinder
            const start = new THREE.Vector3(currentPosX, currentPosY, currentPosZ);
            const end = new THREE.Vector3(ghostPosX, ghostPosY, ghostPosZ);
            const direction = end.clone().sub(start);
            const length = direction.length();
            const midpoint = start.clone().add(direction.multiplyScalar(0.5));
            
            // Calculate rotation to orient the cylinder
            const cylinderDirection = new THREE.Vector3(0, 1, 0);
            const targetDirection = direction.clone().normalize();
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(cylinderDirection, targetDirection);
            
            lines.push(
              <mesh 
                key={`line-${y}-${x}`} 
                position={[midpoint.x, midpoint.y, midpoint.z]} 
                quaternion={quaternion}
              >
                <cylinderGeometry args={[0.03, 0.03, length, 4]} />
                <meshBasicMaterial 
                  color={lineColor} 
                  transparent={true} 
                  opacity={0.4} 
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return lines;
  }, [currentBlock.shape, position, ghostPosition, blockColor, grid.length]);

  // Render highlighted layer visualizations
  const renderHighlightedLayers = useMemo(() => {
    const highlights = [];
    const gridSize = grid.length || 10;
    
    for (const layer of highlightedLayers) {
      if (layer.type === 'fullLayer') {
        highlights.push(
          <mesh 
            key={`highlight-layer-${layer.y}`} 
            position={[gridSize/2 - 0.5, layer.y, gridSize/2 - 0.5]}
          >
            <boxGeometry args={[gridSize, 0.1, gridSize]} />
            <meshBasicMaterial 
              color="white" 
              transparent={true} 
              opacity={0.2} 
            />
          </mesh>
        );
      } else if (layer.type === 'horizontalRow') {
        highlights.push(
          <mesh 
            key={`highlight-row-${layer.y}-${layer.index}`} 
            position={[layer.index, layer.y, gridSize/2 - 0.5]}
          >
            <boxGeometry args={[0.1, 0.1, gridSize]} />
            <meshBasicMaterial 
              color="white" 
              transparent={true} 
              opacity={0.2} 
            />
          </mesh>
        );
      } else if (layer.type === 'horizontalColumn') {
        highlights.push(
          <mesh 
            key={`highlight-col-${layer.y}-${layer.index}`} 
            position={[gridSize/2 - 0.5, layer.y, layer.index]}
          >
            <boxGeometry args={[gridSize, 0.1, 0.1]} />
            <meshBasicMaterial 
              color="white" 
              transparent={true} 
              opacity={0.2} 
            />
          </mesh>
        );
      } else if (layer.type === 'verticalColumn') {
        highlights.push(
          <mesh 
            key={`highlight-vcol-${layer.y}-${layer.index}`} 
            position={[layer.index, gridSize/2 - 0.5, layer.y]}
          >
            <boxGeometry args={[0.1, gridSize, 0.1]} />
            <meshBasicMaterial 
              color="white" 
              transparent={true} 
              opacity={0.2} 
            />
          </mesh>
        );
      }
    }
    
    return highlights;
  }, [highlightedLayers, grid.length]);

  return (
    <group>
      {renderPlacedBlocks}
      {renderCurrentBlock}
      {renderGhostBlock}
      {renderPredictionLines}
      {renderGridBoundaries}
      {renderHighlightedLayers}
      <gridHelper args={[10, 10]} position={[4.5, -0.5, 4.5]} />
    </group>
  );
};

export default Grid3D;
