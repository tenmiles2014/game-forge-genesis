
import React from 'react';
import { Line } from '@react-three/drei';

interface SpawnPointIndicatorProps {
  gridSize: number;
}

const SpawnPointIndicator: React.FC<SpawnPointIndicatorProps> = ({ gridSize }) => {
  // Center position of the spawn area
  const centerX = Math.floor(gridSize / 2);
  const centerZ = Math.floor(gridSize / 2);
  const topY = gridSize - 1; // Position at ceiling
  
  // Size of the spawn area frame - exactly 10x10
  const frameSize = 10;
  const halfFrameSize = frameSize / 2;
  
  // Calculate corner positions with even padding
  const frameX = centerX - halfFrameSize - 0.5; // Adjust to center with even padding
  const frameZ = centerZ - halfFrameSize - 0.5;
  
  // Points for the frame - at ceiling level
  const framePoints = [
    // Square at ceiling level
    [frameX, topY, frameZ], // Start
    [frameX + frameSize + 1, topY, frameZ], // to right
    [frameX + frameSize + 1, topY, frameZ + frameSize + 1], // to back
    [frameX, topY, frameZ + frameSize + 1], // to left
    [frameX, topY, frameZ], // back to start
  ];
  
  return (
    <>
      {/* Frame corners */}
      {[0, 1, 2, 3].map((corner) => {
        const x = frameX + (corner % 2) * (frameSize + 1);
        const z = frameZ + Math.floor(corner / 2) * (frameSize + 1);
        
        return (
          <mesh 
            key={`spawnframe-corner-${corner}`} 
            position={[x, topY, z]}
          >
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
      
      {/* Frame outline using drei's Line component */}
      <Line
        points={framePoints}
        color="#ffff00"
        lineWidth={2}
        dashed={false}
      />
    </>
  );
};

export default SpawnPointIndicator;
