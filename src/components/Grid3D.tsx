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
  const gridRef = useRef<string>("");
  const forceUpdateRef = useRef<number>(0);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const { scene } = useThree();
  const blinkingTimerRef = useRef<number>(0);
  const blinkPhaseRef = useRef<boolean>(false);
  const particlesRef = useRef<THREE.Points[]>([]);
  const dustParticlesActive = useRef<boolean>(false);
  
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

  const createDustExplosion = (position: [number, number, number], color: THREE.Color) => {
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = position[0];
      particlePositions[i * 3 + 1] = position[1];
      particlePositions[i * 3 + 2] = position[2];
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: color,
      size: 0.2,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    const velocities = Array(particleCount).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3,
      z: (Math.random() - 0.5) * 0.3,
    }));
    
    scene.add(particles);
    
    const particleSystem = {
      points: particles,
      velocities,
      life: 1.0,
      update: (delta: number) => {
        particleSystem.life -= delta;
        
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] += velocities[i].x;
          positions[i * 3 + 1] += velocities[i].y;
          positions[i * 3 + 2] += velocities[i].z;
          
          velocities[i].y -= 0.01;
        }
        
        (particles.material as THREE.PointsMaterial).opacity = particleSystem.life;
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        return particleSystem.life <= 0;
      },
      dispose: () => {
        particles.geometry.dispose();
        (particles.material as THREE.PointsMaterial).dispose();
        scene.remove(particles);
      }
    };
    
    return particleSystem;
  };

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
      
      particlesRef.current.forEach(particles => {
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material) {
          if (Array.isArray(particles.material)) {
            particles.material.forEach(mat => mat.dispose());
          } else {
            particles.material.dispose();
          }
        }
        if (particles.parent) particles.parent.remove(particles);
      });
      particlesRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (blinkingLayers.length > 0 && !dustParticlesActive.current) {
      dustParticlesActive.current = true;
      
      const activeSystems: any[] = [];
      const gridSize = grid.length || 10;
      
      blinkingLayers.forEach(layer => {
        if (layer.type === 'row' && layer.y !== undefined && layer.z !== undefined) {
          for (let x = 0; x < gridSize; x++) {
            if (grid[layer.y][x][layer.z] !== 0) {
              const color = getColor(grid[layer.y][x][layer.z]);
              const particleSystem = createDustExplosion([x, layer.y, layer.z], color);
              activeSystems.push(particleSystem);
            }
          }
        } else if (layer.type === 'column' && layer.y !== undefined && layer.x !== undefined) {
          for (let z = 0; z < gridSize; z++) {
            if (grid[layer.y][layer.x][z] !== 0) {
              const color = getColor(grid[layer.y][layer.x][z]);
              const particleSystem = createDustExplosion([layer.x, layer.y, z], color);
              activeSystems.push(particleSystem);
            }
          }
        } else if (layer.type === 'column' && layer.x !== undefined && layer.z !== undefined) {
          for (let y = 0; y < gridSize; y++) {
            if (grid[y][layer.x][layer.z] !== 0) {
              const color = getColor(grid[y][layer.x][layer.z]);
              const particleSystem = createDustExplosion([layer.x, y, layer.z], color);
              activeSystems.push(particleSystem);
            }
          }
        } else if (layer.type === 'layer' && layer.y !== undefined) {
          for (let x = 0; x < gridSize; x++) {
            for (let z = 0; z < gridSize; z++) {
              if (grid[layer.y][x][z] !== 0) {
                const color = getColor(grid[layer.y][x][z]);
                const particleSystem = createDustExplosion([x, layer.y, z], color);
                activeSystems.push(particleSystem);
              }
            }
          }
        }
      });
      
      particlesRef.current = activeSystems.map(system => system.points);
    }
    
    if (blinkingLayers.length === 0) {
      dustParticlesActive.current = false;
    }
  }, [blinkingLayers, grid]);

  useFrame((state, delta) => {
    if (blinkingLayers.length > 0) {
      blinkingTimerRef.current += 1;
      if (blinkingTimerRef.current >= 12) {
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
      
      if (particlesRef.current.length > 0) {
        const activeSystems = scene.children.filter(
          child => child instanceof THREE.Points && 
          particlesRef.current.includes(child)
        ) as THREE.Points[];
        
        activeSystems.forEach(points => {
          const index = scene.children.indexOf(points);
          if (index !== -1) {
            const positions = points.geometry.attributes.position.array as Float32Array;
            const count = positions.length / 3;
            
            for (let i = 0; i < count; i++) {
              positions[i * 3] += (Math.random() - 0.5) * 0.05;
              positions[i * 3 + 1] += (Math.random() - 0.5) * 0.05 - 0.02;
              positions[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
              
              (points.material as THREE.PointsMaterial).opacity -= 0.005;
            }
            
            points.geometry.attributes.position.needsUpdate = true;
            
            if ((points.material as THREE.PointsMaterial).opacity <= 0) {
              scene.remove(points);
              if (points.geometry) points.geometry.dispose();
              if (points.material) {
                if (Array.isArray(points.material)) {
                  points.material.forEach(mat => mat.dispose());
                } else {
                  points.material.dispose();
                }
              }
              particlesRef.current = particlesRef.current.filter(p => p !== points);
            }
          }
        });
      }
    }
  });

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
            
            const isBlinking = isInBlinkingLayer(y, x, z);
            
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
            
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
            
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
    </group>
  );
};

export default Grid3D;
