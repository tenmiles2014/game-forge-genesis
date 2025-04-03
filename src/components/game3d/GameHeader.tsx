
import React from 'react';
import ViewControls, { ViewPoint } from '../ViewControls';

interface GameHeaderProps {
  viewPoints: ViewPoint[];
  onSelectView: (viewPoint: ViewPoint) => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ viewPoints, onSelectView }) => {
  return (
    <div className="flex justify-end items-center mb-2 p-2">
      <ViewControls viewPoints={viewPoints} onSelectView={onSelectView} />
    </div>
  );
};

export default GameHeader;
