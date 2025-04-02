
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CameraIcon } from 'lucide-react';

export interface ViewPoint {
  name: string;
  position: [number, number, number];
  target?: [number, number, number];
}

interface ViewControlsProps {
  viewPoints: ViewPoint[];
  onSelectView: (viewPoint: ViewPoint) => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({ viewPoints, onSelectView }) => {
  return (
    <div className="flex gap-2 items-center">
      <Select onValueChange={(value) => {
        const selectedView = viewPoints.find(v => v.name === value);
        if (selectedView) {
          onSelectView(selectedView);
        }
      }}>
        <SelectTrigger className="w-[180px] bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300">
          <CameraIcon className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent>
          {viewPoints.map((viewPoint) => (
            <SelectItem key={viewPoint.name} value={viewPoint.name}>
              {viewPoint.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ViewControls;
