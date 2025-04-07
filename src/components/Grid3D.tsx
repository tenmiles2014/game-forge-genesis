import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BlockPattern } from './BlockPatterns';
import { useFrame, useThree } from '@react-three/fiber';
import LevelIndicator from './LevelIndicator';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  level: number;
}

const Grid3D: React.FC<Grid3DProps> = ({ grid, currentBlock, position, level }) => {
  const gridRef = useRef<string>("");
  const forceUpdateRef = useRef<number>(0);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const { scene } = useThree();
  
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

  useEffect(() => {
    return () => {
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
  
  useFrame(() => {
    const currentFingerprint = getGridFingerprint();
    if (currentFingerprint !== gridRef.current) {
      gridRef.current = currentFingerprint;
      forceUpdateRef.current += 1;
      
      const newKeys = new Set<string>();
      const gridSize = grid.length || 10;
      
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          for (let z = 0; z < gridSize; z++) {
            if (grid[y][x][z] !== 0) {
              newKeys.add(`${y}-${x}-${z}`);
            }
          }
        }
      }
      
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

  const renderPlacedBlocks = useMemo(() => {
    console.log("Rendering placed blocks with force update:", forceUpdateRef.current);
    
    const blocks: JSX.Element[] = [];
    const gridSize = grid.length || 10;
    const timestamp = Date.now();
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const cellValue = grid[y][x][z];
          if (cellValue !== 0) {
            const posKey = `${y}-${x}-${z}`;
            const uniqueKey = `block-${posKey}-${cellValue}-${timestamp}-${forceUpdateRef.current}`;
            
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
                <meshStandardMaterial color={getColor(cellValue)} />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [grid, forceUpdateRef.current]);

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
                  color="#F97316" 
                  transparent={true} 
                  opacity={0.3} 
                  wireframe={true}
                  wireframeLinewidth={2}
                />
              </mesh>
            );
          }
        }
      }
    }
    
    return blocks;
  }, [currentBlock.shape, ghostPosition, position.y, grid.length]);

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

  const renderPredictionLines = useMemo(() => {
    const lines = [];
    const pattern = currentBlock.shape;
    const gridSize = grid.length || 10;
    
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
            
            const lineColor = new THREE.Color(blockColor);
            
            const start = new THREE.Vector3(currentPosX, currentPosY, currentPosZ);
            const end = new THREE.Vector3(ghostPosX, ghostPosY, ghostPosZ);
            const direction = end.clone().sub(start);
            const length = direction.length();
            const midpoint = start.clone().add(direction.multiplyScalar(0.5));
            
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

  return (
    <group key={`full-grid-${forceUpdateRef.current}-${Date.now()}`}>
      {renderPlacedBlocks}
      {renderCurrentBlock}
      {renderGhostBlock}
      {renderPredictionLines}
      {renderGridBoundaries}
      <gridHelper args={[10, 10]} position={[4.5, -0.5, 4.5]} />
      <LevelIndicator level={level} gridSize={grid.length} />
    </group>
  );
};

export default Grid3D;
