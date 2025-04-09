
import React from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon, ArrowUp, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ViewPoint {
  name: string;
  position: [number, number, number];
  target?: [number, number, number];
  icon: React.ReactNode;
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
      <TooltipProvider delayDuration={300}>
        {viewPoints.map((viewPoint) => (
          <Tooltip key={viewPoint.name}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300 w-8 h-8 sm:w-9 sm:h-9"
                onClick={() => onSelectView(viewPoint)}
              >
                {viewPoint.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{viewPoint.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};

export default ViewControls;
