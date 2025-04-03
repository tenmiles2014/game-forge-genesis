
import React from 'react';
import * as THREE from 'three';

interface SpawnPointIndicatorProps {
  gridSize: number;
}

const SpawnPointIndicator: React.FC<SpawnPointIndicatorProps> = ({ gridSize }) => {
  // Center position of the spawn area
  const centerX = Math.floor(gridSize / 2);
  const centerZ = Math.floor(gridSize / 2);
  const topY = gridSize - 1;
  
  // Size of the spawn area frame
  const frameSize = 6;
  const frameThickness = 0.05;
  const halfFrameSize = frameSize / 2;
  
  // Create frame corners
  const frameCorners = [];
  
  // Calculate corner positions
  const frameX = centerX - halfFrameSize;
  const frameZ = centerZ - halfFrameSize;
  
  // Create the frame - horizontal edges first
  for (let x = 0; x < frameSize; x++) {
    for (let z = 0; z < frameSize; z++) {
      // Only add blocks for the edges
      if (x === 0 || x === frameSize - 1 || z === 0 || z === frameSize - 1) {
        frameCorners.push(
          <mesh 
            key={`spawnframe-${x}-${z}`} 
            position={[frameX + x, topY + 0.5, frameZ + z]}
          >
            <boxGeometry args={[frameThickness, frameThickness, frameThickness]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
        );
      }
    }
  }
  
  // Add connecting lines
  const points = [
    // Top frame
    [frameX, topY + 0.5, frameZ],
    [frameX + frameSize, topY + 0.5, frameZ],
    
    [frameX + frameSize, topY + 0.5, frameZ],
    [frameX + frameSize, topY + 0.5, frameZ + frameSize],
    
    [frameX + frameSize, topY + 0.5, frameZ + frameSize],
    [frameX, topY + 0.5, frameZ + frameSize],
    
    [frameX, topY + 0.5, frameZ + frameSize],
    [frameX, topY + 0.5, frameZ],
  ];
  
  const lines = [];
  
  for (let i = 0; i < points.length; i += 2) {
    const start = points[i];
    const end = points[i + 1];
    
    const linePoints = [];
    linePoints.push(new THREE.Vector3(start[0], start[1], start[2]));
    linePoints.push(new THREE.Vector3(end[0], end[1], end[2]));
    
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    
    lines.push(
      <line key={`line-${i}`} geometry={lineGeometry}>
        <lineBasicMaterial color="#ffff00" linewidth={2} />
      </line>
    );
  }
  
  return (
    <>
      {frameCorners}
      {lines}
      <mesh position={[centerX, topY + 1, centerZ]}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#ffff00" transparent={true} opacity={0.7} />
      </mesh>
      <pointLight position={[centerX, topY + 1, centerZ]} intensity={0.5} color="#ffff00" distance={5} />
    </>
  );
};

export default SpawnPointIndicator;
