
import React from 'react';
import { Label } from "@/components/ui/label";

const Grid3DLabels: React.FC = () => {
  return (
    <div className="grid-labels absolute w-full h-full pointer-events-none">
      {/* Top label */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Top</Label>
      </div>
      
      {/* Bottom label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Bottom</Label>
      </div>
      
      {/* Left label */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 ml-2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Left</Label>
      </div>
      
      {/* Right label */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Right</Label>
      </div>
      
      {/* Front label */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Front</Label>
      </div>
      
      {/* Back label */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Back</Label>
      </div>
    </div>
  );
};

export default Grid3DLabels;
