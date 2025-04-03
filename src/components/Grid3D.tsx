
import React from 'react';
import { BlockPattern } from './BlockPatterns';
import ActiveBlock from './grid3d/ActiveBlock';
import GridBlocks from './grid3d/GridBlocks';
import GridBoundaries from './grid3d/GridBoundaries';
import SpawnPointIndicator from './grid3d/SpawnPointIndicator';
import LandingPreview from './grid3d/LandingPreview';
import FlashEffect from './grid3d/FlashEffect';
import { calculateLandingPosition } from './utils/landingCalculator';

interface Grid3DProps {
  grid: number[][][];
  currentBlock: BlockPattern;
  position: { x: number; y: number; z: number };
  linesCleared: number;
  isGameActive?: boolean;
}

const Grid3D: React.FC<Grid3DProps> = ({ 
  grid, 
  currentBlock, 
  position, 
  linesCleared,
  isGameActive = false
}) => {
  // Default grid size if grid is not initialized yet
  const gridSize = grid?.length || 10;
  
  // Calculate landing position for preview, with additional safety checks
  let landingPosition = null;
  try {
    if (grid && grid.length > 0 && currentBlock && position) {
      landingPosition = calculateLandingPosition(grid, currentBlock, position);
    } else {
      landingPosition = position ? { ...position } : null;
    }
  } catch (error) {
    console.error("Error calculating landing position:", error);
    landingPosition = position ? { ...position } : null;
  }

  return (
    <group>
      {/* Grid boundaries */}
      <GridBoundaries gridSize={gridSize} />
      
      {/* Active blocks in the grid */}
      {grid && grid.length > 0 && (
        <GridBlocks grid={grid} />
      )}
      
      {/* Current moving block */}
      {currentBlock && position && (
        <ActiveBlock 
          currentBlock={currentBlock}
          position={position} 
        />
      )}
      
      {/* Landing preview - only render if all required props are valid */}
      {currentBlock && position && landingPosition && landingPosition.y !== undefined && position.y !== landingPosition.y && (
        <LandingPreview 
          currentBlock={currentBlock}
          position={position}
          landingY={landingPosition.y}
        />
      )}
      
      {/* Flash effect on line clear */}
      <FlashEffect 
        active={linesCleared > 0} 
      />
      
      {/* Spawn point indicator */}
      <SpawnPointIndicator 
        gridSize={gridSize}
        isGameActive={isGameActive}
      />
    </group>
  );
};

export default Grid3D;
