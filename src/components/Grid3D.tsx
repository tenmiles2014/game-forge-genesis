
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BlockPattern } from './BlockPatterns';
import { useFrame, useThree } from '@react-three/fiber';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  blinkingLayers?: Array<{
    type: 'row' | 'column' | 'layer', 
    y?: number, 
    x?: number, 
    z?: number
  }>;
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, blinkingLayers = [] }) => {
  // For tracking grid changes and forcing re-renders
  const gridRef = useRef<string>("");
  const forceUpdateRef = useRef<number>(0);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const { scene } = useThree();
  const blinkingTimerRef = useRef<number>(0);
  const blinkPhaseRef = useRef<boolean>(false);
  
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

  // Generate a grid fingerprint for change detection
  const getGridFingerprint = () => {
    let fingerprint = "";
    const gridSize = grid.length || 10;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          if (grid[y][x][z] !== 0) {
            fingerprint += `${y},${x},${z},${grid[y][x][z]};`;
          }
        }
      }
    }
    
    return fingerprint;
  };

  // Effect to clean up old meshes when grid changes
  useEffect(() => {
    return () => {
      // Clean up all meshes on component unmount
      meshRefs.current.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      meshRefs.current.clear();
    };
  }, []);
  
  // Blinking animation for complete layers
  useFrame(() => {
    // Update blink phase for blinking layers (about 5 times per second)
    if (blinkingLayers.length > 0) {
      blinkingTimerRef.current += 1;
      if (blinkingTimerRef.current >= 12) { // ~200ms at 60fps
        blinkingTimerRef.current = 0;
        blinkPhaseRef.current = !blinkPhaseRef.current;
      }
    } else {
      blinkPhaseRef.current = false;
      blinkingTimerRef.current = 0;
    }
    
    const currentFingerprint = getGridFingerprint();
    if (currentFingerprint !== gridRef.current) {
      gridRef.current = currentFingerprint;
      forceUpdateRef.current += 1;
      
      // Clean up old meshes that are no longer needed
      const newKeys = new Set<string>();
      const gridSize = grid.length || 10;
      
      // Collect keys for current blocks
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
            if (grid[y][x][z] !== 0) {
              newKeys.add(`${y}-${x}-${z}`);
            }
          }
        }
      }
      
      // Remove meshes that are no longer in the grid
      meshRefs.current.forEach((mesh, key) => {
        if (!newKeys.has(key)) {
          if (mesh.parent) mesh.parent.remove(mesh);
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
          meshRefs.current.delete(key);
        }
      });
    }
  });

  // Check if a cell is in a blinking layer
  const isInBlinkingLayer = (y: number, x: number, z: number) => {
    if (!blinkingLayers.length) return false;
    
    return blinkingLayers.some(layer => {
      if (layer.type === 'row' && layer.y === y && layer.z === z) {
        return true;
      }
      if (layer.type === 'column' && layer.y === y && layer.x === x) {
        return true;
      }
      if (layer.type === 'column' && layer.x === x && layer.z === z) {
        return true;
      }
      if (layer.type === 'layer' && layer.y === y) {
        return true;
      }
      return false;
    });
  };

  // Render placed blocks using individual instances with explicit cleanup
  const renderPlacedBlocks = useMemo(() => {
    console.log("Rendering placed blocks with force update:", forceUpdateRef.current);
    
    const blocks: JSX.Element[] = [];
    const gridSize = grid.length || 10;
    const timestamp = Date.now(); // Add timestamp to ensure uniqueness
    
    // Generate new block meshes every time grid changes
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const cellValue = grid[y][x][z];
          if (cellValue !== 0) {
            const posKey = `${y}-${x}-${z}`;
            const uniqueKey = `block-${posKey}-${cellValue}-${timestamp}-${forceUpdateRef.current}`;
            
            // Check if this block is in a blinking layer
            const isBlinking = isInBlinkingLayer(y, x, z);
            
            // Skip rendering during the "off" phase of blinking
            if (isBlinking && blinkPhaseRef.current) {
              continue;
            }
            
            blocks.push(
              <mesh 
                key={uniqueKey}
                position={[x, y, z]} 
                castShadow
                receiveShadow
                ref={(mesh: THREE.Mesh) => {
                  if (mesh) {
                    meshRefs.current.set(posKey, mesh);
                  }
                }}
              >
                <boxGeometry args={[0.95, 0.95, 0.95]} />
                <meshStandardMaterial 
                  color={getColor(cellValue)} 
                  emissive={isBlinking ? new THREE.Color('#ffffff') : undefined}
                  emissiveIntensity={isBlinking ? 0.5 : 0}
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [grid, forceUpdateRef.current, blinkingLayers, blinkPhaseRef.current]);

  // Render ghost block (prediction)
  const renderGhostBlock = useMemo(() => {
    const blocks = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
    // Enhanced ghost block rendering with glowy effect
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
                  color="#F97316"  // Bright Orange
                  transparent={true} 
                  opacity={0.6}    // More visible
                  emissive="#F97316"  // Add emissive glow
                  emissiveIntensity={0.5}  // Adjust glow intensity
                  wireframe={true}
                  wireframeLinewidth={2}  // Thick wireframe lines
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

  // Use a group component with a key to force full replacement
  return (
    <group key={`full-grid-${forceUpdateRef.current}-${Date.now()}`}>
      {renderPlacedBlocks}
      {renderCurrentBlock}
      {renderGhostBlock}
      {renderPredictionLines}
      {renderGridBoundaries}
      <gridHelper args={[10, 10]} position={[4.5, -0.5, 4.5]} />
    </group>
  );
};

export default Grid3D;

