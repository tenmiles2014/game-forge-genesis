
import React from 'react';
import { Label } from "@/components/ui/label";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';

const Grid3DLabels: React.FC = () => {
  return (
    <div className="grid-labels absolute w-full h-full pointer-events-none">
      {/* Top (+Y) label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-4 flex flex-col items-center">
        <ArrowUp className="w-6 h-6 text-blue-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs mt-1">+Y (Top)</Label>
      </div>
      
      {/* Bottom (-Y) label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-4 flex flex-col items-center">
        <ArrowDown className="w-6 h-6 text-blue-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs mt-1">-Y (Bottom)</Label>
      </div>
      
      {/* Left (-X) label */}
      <div className="absolute top-1/2 left-2 -translate-y-1/2 flex items-center">
        <ArrowLeft className="w-6 h-6 text-red-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs ml-1">-X (Left)</Label>
      </div>
      
      {/* Right (+X) label */}
      <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center flex-row-reverse">
        <ArrowRight className="w-6 h-6 text-red-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs mr-1">+X (Right)</Label>
      </div>
      
      {/* Front (+Z) label */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <Plus className="w-6 h-6 text-green-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs mt-1">+Z (Front)</Label>
      </div>
      
      {/* Back (-Z) label */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <Minus className="w-6 h-6 text-green-500 stroke-2 bg-black/50 rounded-full p-1" />
        <Label className="text-white bg-black/70 px-2 py-1 rounded-md font-medium text-xs mt-1">-Z (Back)</Label>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 rounded-md bg-black/70 p-2 text-xs flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-white">X-axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-white">Y-axis</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-white">Z-axis</span>
        </div>
      </div>
    </div>
  );
};

export default Grid3DLabels;
