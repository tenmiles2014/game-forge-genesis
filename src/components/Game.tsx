
import React from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameKeyboardControls } from '../hooks/useGameKeyboardControls';
import GameBoard from './GameBoard';
import GamePanel from './GamePanel';
import GameOverMessage from './GameOverMessage';

const Game: React.FC = () => {
  const {
    score,
    linesCleared,
    nextBlock,
    gameOver,
    gamePaused,
    moveBlock,
    rotateBlock,
    dropBlock,
    togglePause,
    resetGame,
    renderGridWithCurrentBlock,
  } = useGameLogic();

  // Setup keyboard controls
  useGameKeyboardControls({
    moveBlock,
    rotateBlock,
    dropBlock,
    gameOver,
    gamePaused
  });

  return (
    <div className="game-circle flex flex-col justify-center items-center min-h-screen p-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white text-center">
        Block Busters
      </h1>
      
      <div className="game-container rounded-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row gap-6 p-6 bg-black bg-opacity-30">
        <div className="flex-1">
          <GameBoard grid={renderGridWithCurrentBlock()} />
        </div>
        
        <GamePanel
          score={score}
          linesCleared={linesCleared}
          nextBlock={nextBlock}
          onReset={resetGame}
          onStartPause={togglePause}
          isPaused={gamePaused}
          gameOver={gameOver}
        />
      </div>
      
      <GameOverMessage gameOver={gameOver} score={score} />
    </div>
  );
};

export default Game;
