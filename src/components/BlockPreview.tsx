
import React from 'react';
import GameBlock from './GameBlock';
import { BlockPattern } from './BlockPatterns';

export interface BlockPreviewProps {
  block: BlockPattern;
  className?: string;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block, className }) => {
  if (!block || !block.shape) {
    // Return an empty placeholder when block is undefined
    return <div className={`${className} bg-gray-800 bg-opacity-20 rounded-lg`}></div>;
  }
  
  const maxRows = Math.max(block.shape.length, 4);
  const maxCols = Math.max(...block.shape.map(row => row.length), 4);
  
  return (
    <div className={`grid gap-1 ${className}`}
         style={{ 
           gridTemplateRows: `repeat(${maxRows}, 1fr)`,
           gridTemplateColumns: `repeat(${maxCols}, 1fr)`
         }}>
      {Array.from({ length: maxRows }).map((_, rowIndex) => (
        Array.from({ length: maxCols }).map((_, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className="aspect-square">
            {rowIndex < block.shape.length && 
             colIndex < block.shape[rowIndex].length && 
             block.shape[rowIndex][colIndex] === 1 && (
              <GameBlock color={block.color} isPreview={true} />
            )}
          </div>
        ))
      ))}
    </div>
  );
};

export default BlockPreview;
