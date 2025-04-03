
import React from 'react';
import GuidelineOverlay from '../GuidelineOverlay';
import GameInitializer from './GameInitializer';
import GameController from './GameController';
import { GameViewManager } from './GameViewManager';
import GameFooter from './GameFooter';
import { useGameState } from '../../hooks/useGameState';

const Game3DContainer: React.FC = () => {
  const {
    grid,
    score,
    gameOver,
    level,
    linesCleared
  } = useGameState();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
          3D Block Busters
        </h1>
        
        <div className="flex-1 flex flex-col">
          <GameInitializer>
            <GameViewManager>
              {() => (
                <GameController />
              )}
            </GameViewManager>
          </GameInitializer>
        </div>
        
        <GameFooter gameOver={gameOver} score={score} level={level} />
      </div>
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3DContainer;
