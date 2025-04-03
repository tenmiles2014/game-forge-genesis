
import React from 'react';
import { Line } from '@react-three/drei';

interface SpawnPointIndicatorProps {
  gridSize: number;
}

const SpawnPointIndicator: React.FC<SpawnPointIndicatorProps> = ({ gridSize }) => {
  // We're returning null to completely remove the spawn point indicator
  // including any ceiling elements
  return null;
};

export default SpawnPointIndicator;
