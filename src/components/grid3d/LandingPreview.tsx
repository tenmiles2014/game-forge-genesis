
import React from 'react';
import { BlockPattern } from '../BlockPatterns';

interface LandingPreviewProps {
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  landingY: number;
}

const LandingPreview: React.FC<LandingPreviewProps> = ({ currentBlock, position, landingY }) => {
  // Safety checks - skip rendering on invalid props
  if (!currentBlock || !position || landingY === undefined || landingY === position.y) {
    return null;
  }
  
  const blocks = [];
  
  // Draw blocks at landing position
  for (let y = 0; y < currentBlock.shape.length; y++) {
    for (let x = 0; x < currentBlock.shape[y].length; x++) {
      if (currentBlock.shape[y][x]) {
        // Landing preview block
        blocks.push(
          <mesh 
            key={`landing-${x}-${y}`} 
            position={[position.x + x, landingY, position.z + y]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={currentBlock.color} 
              transparent={true} 
              opacity={0.5}
              wireframe={false}
            />
          </mesh>
        );
        
        // Add drop line visualization using cylindrical meshes
        if (Math.abs(position.y - landingY) > 1) {
          const height = Math.abs(position.y - landingY);
          const midY = (position.y + landingY) / 2;
          
          blocks.push(
            <mesh 
              key={`drop-line-${x}-${y}`} 
              position={[position.x + x, midY, position.z + y]}
              rotation={[0, 0, 0]}
            >
              <cylinderGeometry args={[0.03, 0.03, height, 4]} />
              <meshBasicMaterial 
                color={currentBlock.color} 
                transparent={true} 
                opacity={0.3} 
              />
            </mesh>
          );
        }
      }
    }
  }
  
  return <>{blocks}</>;
};

export default LandingPreview;
