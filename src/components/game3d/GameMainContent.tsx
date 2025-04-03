
import React from 'react';
import GameContainer from './GameContainer';
import GameOverlay from './GameOverlay';
import { ViewPoint } from '../ViewControls';

interface GameMainContentProps {
  grid: number[][][];
  currentBlock: any;
  position: { x: number; y: number; z: number };
  linesCleared: number;
  controlsEnabled: boolean;
  currentView: ViewPoint;
  orbitControlsRef: React.RefObject<any>;
  gamePaused: boolean;
  gameOver: boolean;
}

const GameMainContent: React.FC<GameMainContentProps> = ({
  grid,
  currentBlock,
  position,
  linesCleared,
  controlsEnabled,
  currentView,
  orbitControlsRef,
  gamePaused,
  gameOver
}) => {
  return (
    <div className="relative flex-1 h-[calc(100vh-160px)] w-full rounded-lg overflow-hidden">
      <GameContainer 
        grid={grid}
        currentBlock={currentBlock}
        position={position}
        linesCleared={linesCleared}
        controlsEnabled={controlsEnabled}
        currentView={currentView}
        orbitControlsRef={orbitControlsRef}
        gamePaused={gamePaused}
        gameOver={gameOver}
      />
      <GameOverlay />
    </div>
  );
};

export default GameMainContent;
