
import React from 'react';
import { ViewPoint } from '../ViewControls';

interface ViewControlsProps {
  viewPoints: ViewPoint[];
  currentView: ViewPoint;
  orbitControlsRef: React.RefObject<any>;
  onSelectView: (viewPoint: ViewPoint) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  viewPoints,
  currentView,
  orbitControlsRef,
  onSelectView
}) => {
  const handleViewChange = (viewPoint: ViewPoint) => {
    onSelectView(viewPoint);
    
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      
      if (controls.object) {
        controls.object.position.set(...viewPoint.position);
        
        if (viewPoint.target) {
          controls.target.set(...viewPoint.target);
        } else {
          controls.target.set(4.5, 4.5, 4.5);
        }
        
        controls.update();
      }
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-4">
      {viewPoints.map((viewPoint, index) => (
        <button
          key={index}
          className={`px-2 py-1 text-sm sm:text-base sm:px-3 rounded ${
            currentView === viewPoint
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          onClick={() => handleViewChange(viewPoint)}
        >
          {viewPoint.name}
        </button>
      ))}
    </div>
  );
};

export default ViewControls;
