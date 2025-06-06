
import React from 'react';
import Game3D from "@/components/Game3D";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="game-container h-screen overflow-hidden">
      <Game3D />
      <Toaster />
    </div>
  );
};

export default Index;
