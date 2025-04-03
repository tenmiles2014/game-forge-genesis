
import React from 'react';

interface FlashEffectProps {
  active: boolean;
}

const FlashEffect: React.FC<FlashEffectProps> = ({ active }) => {
  if (!active) return null;
  
  return (
    <pointLight 
      position={[5, 5, 5]} 
      intensity={5} 
      color="#ffffff" 
      distance={20}
    />
  );
};

export default FlashEffect;
