
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Grid3D from '../Grid3D';
import Grid3DLabels from '../Grid3DLabels';
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
  gamePaused: boolean;
  gameOver: boolean;
  score?: number;
}

const GameContainer: React.FC<GameContainerProps> = ({
  grid,
  currentBlock,
  position,
  linesCleared,
  controlsEnabled,
  currentView,
  orbitControlsRef,
  gamePaused,
  gameOver,
  score = 0
}) => {
  const isGameActive = !gamePaused && !gameOver;

  return (
    <div className="game-container w-full h-full min-h-[400px] md:min-h-[600px] lg:min-h-[700px] rounded-lg overflow-hidden relative">
      <Canvas 
        className="w-full h-full absolute inset-0"
        camera={{ position: [10, 10, 10], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        
        <Grid3D 
          grid={grid} 
          currentBlock={currentBlock} 
          position={position}
          linesCleared={linesCleared}
          isGameActive={isGameActive}
        />
        
        <OrbitControls 
          ref={orbitControlsRef} 
          enabled={true}
          minDistance={8}
          maxDistance={25}
          target={[4.5, 4.5, 4.5]}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {(gamePaused || gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
          <div className="text-center p-6 bg-black/80 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">
              {gameOver ? 'Game Over' : 'Game Paused'}
            </h2>
            {gameOver && (
              <p className="text-gray-300 mb-4">Final Score: {score}</p>
            )}
            <p className="text-gray-400 text-sm">
              {gameOver 
                ? 'Press Reset to play again' 
                : 'Press Start to continue playing'}
            </p>
          </div>
        </div>
      )}
      
      <Grid3DLabels />
    </div>
  );
};

export default GameContainer;
