
// Helper function to get color from index
export const getColorFromIndex = (index: number): string => {
  const colors: Record<number, string> = {
    1: 'blue',
    2: 'red',
    3: 'green',
    4: 'purple',
    5: 'yellow',
    0: 'gray'
  };
  return colors[index] || 'gray';
};
