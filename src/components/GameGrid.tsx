
import React from 'react';
import GameBlock from './GameBlock';

export interface GridCellState {
  filled: boolean;
  color: string;
}

interface GameGridProps {
  grid: GridCellState[][];
  className?: string;
}

const GameGrid: React.FC<GameGridProps> = ({ grid, className }) => {
  return (
    <div className={`grid gap-[2px] ${className}`} 
         style={{ 
           gridTemplateRows: `repeat(${grid.length}, 1fr)`,
           gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`
         }}>
      {grid.map((row, rowIndex) => 
        row.map((cell, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className="aspect-square">
            {cell.filled && <GameBlock color={cell.color} />}
          </div>
        ))
      )}
    </div>
  );
};

export default GameGrid;
