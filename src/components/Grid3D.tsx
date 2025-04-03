
import React, { useEffect } from 'react';
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
  // Log component rendering with key props
  useEffect(() => {
    console.log("Grid3D rendering with:", {
      gridSize: grid?.length || 0,
      blockColor: currentBlock?.color || 'none',
      position: position ? `x:${position.x}, y:${position.y}, z:${position.z}` : 'undefined',
      isGameActive
    });
  }, [grid, currentBlock, position, isGameActive]);

  // Default grid size if grid is not initialized yet
  const gridSize = grid?.length || 10;
  
  // Calculate landing position for preview, with enhanced safety checks
  let landingPosition = { ...position }; // Start with current position as default
  let validLandingPosition = false;
  
  try {
    // Only attempt to calculate landing if we have all required data
    if (grid?.length > 0 && 
        currentBlock?.shape?.length > 0 && 
        position?.x !== undefined && 
        position?.y !== undefined && 
        position?.z !== undefined) {
      
      // Calculate landing position safely
      landingPosition = calculateLandingPosition(grid, currentBlock, position);
      
      // Verify the landing position is different from current position and valid
      validLandingPosition = 
        landingPosition &&
        landingPosition.y !== undefined && 
        position.y !== landingPosition.y && 
        landingPosition.y >= 0;
      
      console.log("Landing position calculated:", {
        landingY: landingPosition.y,
        currentY: position.y,
        valid: validLandingPosition
      });
    } else {
      console.warn("Cannot calculate landing position - missing required data", {
        gridExists: !!grid,
        gridLength: grid?.length || 0,
        currentBlockExists: !!currentBlock,
        currentBlockShapeExists: !!currentBlock?.shape,
        positionExists: !!position,
        positionX: position?.x,
        positionY: position?.y,
        positionZ: position?.z
      });
    }
  } catch (error) {
    console.error("Error calculating or validating landing position:", error);
  }

  return (
    <group>
      {/* Grid boundaries */}
      <GridBoundaries gridSize={gridSize} />
      
      {/* Active blocks in the grid */}
      {grid && grid.length > 0 && (
        <GridBlocks grid={grid} />
      )}
      
      {/* Current moving block - only render if all required props are valid */}
      {currentBlock?.shape && position?.x !== undefined && position?.y !== undefined && position?.z !== undefined && (
        <ActiveBlock 
          currentBlock={currentBlock}
          position={position} 
        />
      )}
      
      {/* Landing preview - only render if we have a valid landing position different from current */}
      {currentBlock?.shape && validLandingPosition && (
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
