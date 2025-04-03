
import React from 'react';
import Grid3DLabels from '../Grid3DLabels';
import Gyroscope from '../Gyroscope';

const GameOverlay: React.FC = () => {
  return (
    <>
      <Grid3DLabels />
      <Gyroscope size={100} className="hidden md:block" />
    </>
  );
};

export default GameOverlay;
