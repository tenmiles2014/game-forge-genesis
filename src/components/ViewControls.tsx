
import React from 'react';
import { Button } from '@/components/ui/button';
import { CameraIcon, ArrowUp, ArrowLeft, Smartphone } from 'lucide-react';
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
  arModeEnabled?: boolean;
  onToggleARMode?: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ 
  viewPoints, 
  onSelectView, 
  className,
  arModeEnabled,
  onToggleARMode
}) => {
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
        
        {/* AR Mode Button - Mobile Only */}
        {isMobile && onToggleARMode && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`w-8 h-8 sm:w-9 sm:h-9 ${
                  arModeEnabled 
                    ? "bg-purple-700 border-purple-500 text-white hover:bg-purple-800" 
                    : "bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300"
                }`}
                onClick={onToggleARMode}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Mobile AR Mode</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default ViewControls;
