
const renderGridBoundaries = useMemo(() => {
  const gridSize = grid.length || 10;
  
  return (
    <mesh position={[gridSize/2 - 0.5, gridSize/2 - 0.5, gridSize/2 - 0.5]}>
      <boxGeometry args={[gridSize, gridSize, gridSize]} />
      <meshStandardMaterial 
        color="white" 
        transparent={true} 
        opacity={0.02}  // Even more transparent 
        wireframe={true} 
      />
    </mesh>
  );
}, [grid]);
