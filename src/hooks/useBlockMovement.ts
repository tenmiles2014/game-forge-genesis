
import { BlockPattern } from "../components/BlockPatterns";
import { toast } from "@/components/ui/use-toast";

type Position = { x: number; y: number; z: number };

export function useBlockMovement(
  grid: number[][][],
  currentBlock: BlockPattern,
  position: Position,
  setPosition: (pos: Position) => void,
  gamePaused: boolean,
  gameOver: boolean,
  controlsEnabled: boolean
) {
  const isValidPosition = (pattern: number[][], newX: number, newY: number, newZ: number) => {
    // Check grid boundaries
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          const gridX = newX + x;
          const gridY = newY;
          const gridZ = newZ + y;
          
          if (
            gridX < 0 || gridX >= grid.length ||
            gridY < 0 || gridY >= grid.length ||
            gridZ < 0 || gridZ >= grid.length
          ) {
            return false;
          }
          
          if (grid[gridY][gridX][gridZ] !== 0) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const moveBlock = (direction: 'left' | 'right' | 'forward' | 'backward' | 'down') => {
    // Only check for game paused or game over state
    if (gameOver || gamePaused) {
      console.log(`Block movement prevented - gameOver: ${gameOver}, gamePaused: ${gamePaused}`);
      return false;
    }
    
    let newX = position.x;
    let newY = position.y;
    let newZ = position.z;
    
    if (direction === 'left') newX -= 1;
    if (direction === 'right') newX += 1;
    if (direction === 'forward') newZ -= 1;
    if (direction === 'backward') newZ += 1;
    if (direction === 'down') newY -= 1; // Move down on Y-axis (since we start from top)
    
    console.log(`Attempting to move block ${direction} from (${position.x},${position.y},${position.z}) to (${newX},${newY},${newZ})`);
    
    if (isValidPosition(currentBlock.shape, newX, newY, newZ)) {
      setPosition({ x: newX, y: newY, z: newZ });
      console.log(`Block moved to (${newX},${newY},${newZ})`);
      return true;
    }
    
    console.log(`Invalid position (${newX},${newY},${newZ}), block not moved`);
    return false;
  };

  const rotateBlock = (axis: 'x' | 'y' | 'z') => {
    // Only check for game paused or game over state
    if (gameOver || gamePaused) {
      console.log(`Block rotation prevented - gameOver: ${gameOver}, gamePaused: ${gamePaused}`);
      return null;
    }
    
    const rotatedPattern = [...currentBlock.shape];
    
    if (axis === 'x' || axis === 'z') {
      const numRows = rotatedPattern.length;
      const numCols = rotatedPattern[0].length;
      
      const newPattern: number[][] = Array(numCols).fill(0).map(() => Array(numRows).fill(0));
      
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          if (axis === 'z') {
            newPattern[c][numRows - 1 - r] = rotatedPattern[r][c];
          } else {
            newPattern[numCols - 1 - c][r] = rotatedPattern[r][c];
          }
        }
      }
      
      if (isValidPosition(newPattern, position.x, position.y, position.z)) {
        return newPattern;
      } else {
        const offsets = [
          { x: -1, y: 0, z: 0 },
          { x: 1, y: 0, z: 0 },
          { x: 0, y: 0, z: -1 },
          { x: 0, y: 0, z: 1 },
          { x: -1, y: 0, z: -1 },
          { x: 1, y: 0, z: -1 },
          { x: -1, y: 0, z: 1 },
          { x: 1, y: 0, z: 1 },
        ];
        
        for (const offset of offsets) {
          const newX = position.x + offset.x;
          const newY = position.y;
          const newZ = position.z + offset.z;
          
          if (isValidPosition(newPattern, newX, newY, newZ)) {
            setPosition({ x: newX, y: newY, z: newZ });
            return newPattern;
          }
        }
        
        toast({
          title: "Can't rotate",
          description: "Not enough space to rotate block",
        });
        
        return null;
      }
    }
    
    return null;
  };

  return {
    isValidPosition,
    moveBlock,
    rotateBlock
  };
}
