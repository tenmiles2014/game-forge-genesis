
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
    <div className="view-controls">
      {viewPoints.map((viewPoint, index) => (
        <button
          key={index}
          className={`px-3 py-1 mx-1 text-sm rounded ${
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
