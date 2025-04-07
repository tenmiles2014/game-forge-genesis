
import React from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon } from 'lucide-react';

export interface ViewPoint {
  name: string;
  position: [number, number, number];
  target?: [number, number, number];
}

interface ViewControlsProps {
  viewPoints: ViewPoint[];
  onSelectView: (viewPoint: ViewPoint) => void;
  className?: string;
}

const ViewControls: React.FC<ViewControlsProps> = ({ viewPoints, onSelectView, className }) => {
  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {viewPoints.map((viewPoint) => (
        <Button
          key={viewPoint.name}
          variant="outline"
          size="sm"
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={() => onSelectView(viewPoint)}
        >
          <CameraIcon className="h-4 w-4 mr-2" />
          {viewPoint.name}
        </Button>
      ))}
    </div>
  );
};

export default ViewControls;
