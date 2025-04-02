
import React from 'react';
import { Label } from "@/components/ui/label";

const Grid3DLabels: React.FC = () => {
  return (
    <div className="grid-labels absolute w-full h-full pointer-events-none">
      {/* Top label with indicator ball */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Top</Label>
      </div>
      
      {/* Bottom label with indicator ball */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Bottom</Label>
      </div>
      
      {/* Left label with indicator ball */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 ml-2 flex items-center">
        <div className="w-3 h-3 rounded-full bg-white mr-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Left</Label>
      </div>
      
      {/* Right label with indicator ball */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-2 flex items-center">
        <div className="w-3 h-3 rounded-full bg-white mr-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Right</Label>
      </div>
      
      {/* Front label with indicator ball */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Front</Label>
      </div>
      
      {/* Back label with indicator ball */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-white mb-1 shadow-lg shadow-white/50"></div>
        <Label className="text-white bg-black bg-opacity-70 px-3 py-1 rounded-md font-semibold">Back</Label>
      </div>
    </div>
  );
};

export default Grid3DLabels;
