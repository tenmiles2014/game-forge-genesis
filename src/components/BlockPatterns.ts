
// Define block patterns similar to Tetris pieces
export type BlockPattern = {
  shape: number[][];
  color: string;
};

export const BLOCK_PATTERNS: BlockPattern[] = [
  // I-Block
  {
    shape: [
      [1, 1, 1, 1]
    ],
    color: 'blue'
  },
  // L-Block
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: 'red'
  },
  // J-Block
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: 'green'
  },
  // O-Block
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'yellow'
  },
  // S-Block
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: 'purple'
  },
  // Z-Block
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: 'red'
  },
  // T-Block
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: 'blue'
  },
  // Small-L Block
  {
    shape: [
      [1, 0],
      [1, 1]
    ],
    color: 'green'
  },
  // Small-J Block
  {
    shape: [
      [0, 1],
      [1, 1]
    ],
    color: 'purple'
  },
  // Single Block
  {
    shape: [
      [1]
    ],
    color: 'yellow'
  }
];

export function getRandomBlockPattern(): BlockPattern {
  const randomIndex = Math.floor(Math.random() * BLOCK_PATTERNS.length);
  return BLOCK_PATTERNS[randomIndex];
}

export function rotateBlockPattern(pattern: number[][]): number[][] {
  const numRows = pattern.length;
  const numCols = pattern[0].length;
  
  // Create a new 2D array with swapped dimensions
  const rotated: number[][] = Array(numCols).fill(0).map(() => Array(numRows).fill(0));
  
  // Perform rotation
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      rotated[c][numRows - 1 - r] = pattern[r][c];
    }
  }
  
  return rotated;
}
