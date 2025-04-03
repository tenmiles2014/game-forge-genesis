
import React, { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { ViewPoint } from '../ViewControls';

const VIEW_POINTS: ViewPoint[] = [
  { name: "Default", position: [15, 15, 15] },
  { name: "Top View", position: [4.5, 25, 4.5], target: [4.5, 0, 4.5] },
  { name: "Side View", position: [25, 5, 4.5], target: [0, 5, 4.5] },
  { name: "Front View", position: [4.5, 5, 25], target: [4.5, 5, 0] },
  { name: "Corner View", position: [20, 10, 20] },
];

export interface GameViewManagerProps {
  children: (currentView: ViewPoint, handleViewChange: (viewPoint: ViewPoint) => void) => React.ReactNode;
}

const GameViewManager: React.FC<GameViewManagerProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewPoint>(VIEW_POINTS[0]);
  
  const handleViewChange = (viewPoint: ViewPoint) => {
    setCurrentView(viewPoint);
    
    toast({
      title: `View Changed`,
      description: `Now viewing from ${viewPoint.name}`,
    });
  };

  return <>{children(currentView, handleViewChange)}</>;
};

export { GameViewManager, VIEW_POINTS };
