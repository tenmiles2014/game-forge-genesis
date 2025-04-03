
import React from 'react';
import { Line } from '@react-three/drei';

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
  
  // Calculate corner positions
  const frameX = centerX - halfFrameSize;
  const frameZ = centerZ - halfFrameSize;
  
  // Points for the frame
  const framePoints = [
    // Top square
    [frameX, topY + 0.5, frameZ], // Start
    [frameX + frameSize, topY + 0.5, frameZ], // to right
    [frameX + frameSize, topY + 0.5, frameZ + frameSize], // to back
    [frameX, topY + 0.5, frameZ + frameSize], // to left
    [frameX, topY + 0.5, frameZ], // back to start
  ];
  
  return (
    <>
      {/* Frame corners */}
      {[0, 1, 2, 3].map((corner) => {
        const x = frameX + (corner % 2) * frameSize;
        const z = frameZ + Math.floor(corner / 2) * frameSize;
        
        return (
          <mesh 
            key={`spawnframe-corner-${corner}`} 
            position={[x, topY + 0.5, z]}
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
