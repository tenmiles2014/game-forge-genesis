
import React, { useEffect, useMemo } from 'react';
import { BlockPattern } from './BlockPatterns';
import ActiveBlock from './grid3d/ActiveBlock';
import GridBlocks from './grid3d/GridBlocks';
import GridBoundaries from './grid3d/GridBoundaries';
import SpawnPointIndicator from './grid3d/SpawnPointIndicator';
import LandingPreview from './grid3d/LandingPreview';
import FlashEffect from './grid3d/FlashEffect';
import { 
  calculateLandingPosition, 
  isValidLandingPosition 
} from './utils/landingCalculator';

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
  const gridSize = grid?.length || 10;
  
  // Memoized landing position calculation
  const { landingPosition, isValid } = useMemo(() => {
    console.log("📊 Grid3D calculating landing position for:", {
      blockColor: currentBlock?.color,
      blockShape: currentBlock?.shape?.length,
      position: position,
      gridInitialized: !!grid && grid.length > 0
    });
    
    if (!grid || !currentBlock?.shape || !position) {
      console.warn("⚠️ Missing data for landing calculation");
      return { 
        landingPosition: {...position}, 
        isValid: false 
      };
    }
    
    const calculatedLandingPosition = calculateLandingPosition(grid, currentBlock, position);
    const validLanding = isValidLandingPosition(grid, currentBlock, position);
    
    // Log differences for debugging
    if (calculatedLandingPosition.y !== position.y) {
      console.log("🔍 Landing diff:", calculatedLandingPosition.y - position.y);
    }
    
    return {
      landingPosition: calculatedLandingPosition,
      isValid: validLanding && (calculatedLandingPosition.y !== position.y)
    };
  }, [grid, currentBlock, position]);
  
  useEffect(() => {
    console.log("🎮 Grid3D rendering with:", { 
      isValid, 
      landingY: landingPosition?.y,
      currentY: position?.y,
      diff: landingPosition ? landingPosition.y - position?.y : "unknown"
    });
  }, [landingPosition, position, isValid]);

  return (
    <group>
      <GridBoundaries gridSize={gridSize} />
      
      {grid && grid.length > 0 && (
        <GridBlocks grid={grid} />
      )}
      
      {currentBlock?.shape && position && (
        <ActiveBlock 
          currentBlock={currentBlock}
          position={position} 
        />
      )}
      
      {currentBlock?.shape && isValid && landingPosition && (
        <LandingPreview 
          currentBlock={currentBlock}
          position={position}
          landingY={landingPosition.y}
        />
      )}
      
      <FlashEffect active={linesCleared > 0} />
      
      <SpawnPointIndicator 
        gridSize={gridSize}
        isGameActive={isGameActive}
      />
    </group>
  );
};

export default Grid3D;
