
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Grid3D from '../Grid3D';
import { BlockPattern } from '../BlockPatterns';
import { ViewPoint } from '../ViewControls';

interface GameContainerProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
  controlsEnabled: boolean;
  currentView: ViewPoint;
  orbitControlsRef: React.RefObject<any>;
}

const GameContainer: React.FC<GameContainerProps> = ({
  grid,
  currentBlock,
  position,
  linesCleared,
  controlsEnabled,
  currentView,
  orbitControlsRef
}) => {
  return (
    <div className="game-board rounded-lg overflow-hidden h-[500px] md:h-[600px] relative">
      <Canvas camera={{ position: currentView.position, fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Grid3D 
          grid={grid} 
          currentBlock={currentBlock} 
          position={position}
          linesCleared={linesCleared}
        />
        <OrbitControls 
          ref={orbitControlsRef} 
          enabled={controlsEnabled}
          minDistance={10}
          maxDistance={30}
          target={currentView.target || [4.5, 4.5, 4.5]}
        />
      </Canvas>
    </div>
  );
};

export default GameContainer;
