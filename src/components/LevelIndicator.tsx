
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LevelIndicatorProps {
  level: number;
  gridSize: number;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, gridSize }) => {
  const circleRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const opacityPulse = useRef<{ value: number, direction: number }>({ value: 0.6, direction: 1 });
  const scaleState = useRef<{ value: number, direction: number }>({ value: 1.3, direction: -1 });
  
  // Determine number of lines based on level
  const getNumLines = () => {
    // For levels 1-5, the number matches the level
    if (level <= 5) return level + 1;
    // For higher levels, use a formula to scale reasonably
    return Math.min(12, Math.floor(5 + level/5));
  };
  
  // Create circle with lines
  useEffect(() => {
    if (circleRef.current) {
      // Clear any existing children
      while (circleRef.current.children.length) {
        const child = circleRef.current.children[0];
        // Type assertion to handle Line or Mesh objects
        if ((child as THREE.Line).geometry) {
          (child as THREE.Line).geometry.dispose();
        }
        if ((child as THREE.Line).material) {
          if (Array.isArray((child as THREE.Line).material)) {
            ((child as THREE.Line).material as THREE.Material[]).forEach(m => m.dispose());
          } else {
            ((child as THREE.Line).material as THREE.Material).dispose();
          }
        }
        circleRef.current.remove(child);
      }
      
      // Create new circle with lines
      const numLines = getNumLines();
      const radius = gridSize * 0.75;
      
      // Create material with initial opacity
      const material = new THREE.LineBasicMaterial({ 
        color: new THREE.Color('#F97316'),
        transparent: true,
        opacity: 0.6,
        linewidth: 2
      });
      materialRef.current = material;
      
      // Create lines radiating from the center
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const lineGeometry = new THREE.BufferGeometry();
        
        // Start at center, end at circle edge
        const vertices = new Float32Array([
          0, 0, 0,
          Math.cos(angle) * radius, 0, Math.sin(angle) * radius
        ]);
        
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const line = new THREE.Line(lineGeometry, material);
        circleRef.current.add(line);
      }
      
      // Create circular outline
      const circleGeometry = new THREE.BufferGeometry();
      const circleVertices = [];
      const circleSegments = 64;
      
      for (let i = 0; i <= circleSegments; i++) {
        const angle = (i / circleSegments) * Math.PI * 2;
        circleVertices.push(
          Math.cos(angle) * radius, 
          0, 
          Math.sin(angle) * radius
        );
      }
      
      circleGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(circleVertices), 3));
      const circle = new THREE.Line(circleGeometry, material);
      circleRef.current.add(circle);
    }
  }, [level, gridSize]);
  
  // Animate the circle
  useFrame((_, delta) => {
    if (circleRef.current && materialRef.current) {
      // Pulse opacity
      opacityPulse.current.value += opacityPulse.current.direction * delta * 0.5;
      if (opacityPulse.current.value >= 0.8) {
        opacityPulse.current.value = 0.8;
        opacityPulse.current.direction = -1;
      } else if (opacityPulse.current.value <= 0.3) {
        opacityPulse.current.value = 0.3;
        opacityPulse.current.direction = 1;
      }
      
      materialRef.current.opacity = opacityPulse.current.value;
      
      // Scale animation (breathe in/out)
      scaleState.current.value += scaleState.current.direction * delta * 0.2;
      if (scaleState.current.value >= 1.3) {
        scaleState.current.value = 1.3;
        scaleState.current.direction = -1;
      } else if (scaleState.current.value <= 1.0) {
        scaleState.current.value = 1.0;
        scaleState.current.direction = 1;
      }
      
      circleRef.current.scale.set(
        scaleState.current.value, 
        scaleState.current.value, 
        scaleState.current.value
      );
      
      // Rotate slowly
      circleRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <group ref={circleRef} position={[gridSize/2 - 0.5, 0, gridSize/2 - 0.5]} />
  );
};

export default LevelIndicator;
