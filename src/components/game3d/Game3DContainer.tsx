
import React, { useEffect } from 'react';
import { getRandomBlockPattern } from '../BlockPatterns';
import GuidelineOverlay from '../GuidelineOverlay';
import GameInitializer from './GameInitializer';
import GameController from './GameController';
import { GameViewManager } from './GameViewManager';
import GameFooter from './GameFooter';
import { useGameState } from '../../hooks/useGameState';

const Game3DContainer: React.FC = () => {
  const {
    grid, setGrid,
    score,
    gameOver,
    level,
    setCurrentBlock,
    setNextBlock,
    initializeGrid
  } = useGameState();

  useEffect(() => {
    console.log("🔄 Initializing grid on component mount");
    const newGrid = initializeGrid();
    setGrid(newGrid);
    setCurrentBlock(getRandomBlockPattern());
    setNextBlock(getRandomBlockPattern());
  }, [setGrid, setCurrentBlock, setNextBlock, initializeGrid]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-2 md:p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">
        3D Block Busters
      </h1>
      
      <GameInitializer>
        <GameViewManager>
          {(currentView, handleViewChange) => (
            <GameController />
          )}
        </GameViewManager>
      </GameInitializer>
      
      <GameFooter gameOver={gameOver} score={score} level={level} />
      
      <GuidelineOverlay />
    </div>
  );
};

export default Game3DContainer;
