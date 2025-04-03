
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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
  // Game is active when it's not paused and not over
  const isGameActive = !gamePaused && !gameOver;

  return (
    <div className="game-board w-full h-full min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] rounded-lg overflow-hidden relative bg-gradient-to-b from-black/20 to-black/40">
      <Canvas camera={{ position: currentView.position, fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Grid3D 
          grid={grid} 
          currentBlock={currentBlock} 
          position={position}
          linesCleared={linesCleared}
          isGameActive={isGameActive}
        />
        <OrbitControls 
          ref={orbitControlsRef} 
          enabled={false} // Disable orbit controls completely
          minDistance={10}
          maxDistance={30}
          target={currentView.target || [4.5, 4.5, 4.5]}
        />
      </Canvas>
      
      {/* Game status overlay during pause or game over */}
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
      
      {/* Grid labels positioned outside the Three.js Canvas */}
      <Grid3DLabels />
    </div>
  );
};

export default GameContainer;
