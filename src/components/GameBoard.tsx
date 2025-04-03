
import React from 'react';
import GameGrid, { GridCellState } from './GameGrid';

interface GameBoardProps {
  grid: GridCellState[][];
}

const GameBoard: React.FC<GameBoardProps> = ({ grid }) => {
  return (
    <div className="game-board rounded-lg overflow-hidden aspect-square">
      <GameGrid 
        grid={grid} 
        className="h-full w-full p-1"
      />
    </div>
  );
};

export default GameBoard;
