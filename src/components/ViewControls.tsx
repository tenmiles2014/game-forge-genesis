
import React from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-wrap gap-1 md:gap-2 items-center ${className}`}>
      {viewPoints.map((viewPoint) => (
        <Button
          key={viewPoint.name}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
          onClick={() => onSelectView(viewPoint)}
        >
          <CameraIcon className={`${isMobile ? 'h-3 w-3 md:h-4 md:w-4' : 'h-4 w-4'} mr-1 md:mr-2`} />
          {viewPoint.name}
        </Button>
      ))}
    </div>
  );
};

export default ViewControls;
