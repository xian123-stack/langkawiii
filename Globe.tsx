import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateFibonacciSphere } from '../utils/math';
import { GLOBE_RADIUS, TOTAL_CARDS } from '../data';
import Card from './Card';
import { MediaItem } from '../types';
import { videoTextureManager } from '../utils/videoManager';

interface GlobeProps {
  mediaList: MediaItem[];
  rotationState: React.MutableRefObject<{ x: number, y: number }>;
  velocityState: React.MutableRefObject<{ x: number, y: number }>;
  isDragging: React.MutableRefObject<boolean>;
  lastInteraction: React.MutableRefObject<number>;
  onSelect: (item: MediaItem) => void;
  onHover?: (info: string) => void;
  onHoverOut?: () => void;
}

export default function Globe({ 
  mediaList, 
  rotationState, 
  velocityState, 
  isDragging, 
  lastInteraction, 
  onSelect, 
  onHover, 
  onHoverOut 
}: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate spherical grid positions and assign media items
  const cardData = useMemo(() => {
    if (!mediaList || mediaList.length === 0) return [];
    
    // Generate Fibonacci sphere points
    const count = Math.max(TOTAL_CARDS, mediaList.length);
    const rawPositions = generateFibonacciSphere(count, GLOBE_RADIUS);
    
    return rawPositions.map((pos, index) => ({
      position: pos,
      scale: 0.6 + ((index * 17) % 7) * 0.1, // Deterministic scale variation between 0.6x and 1.2x
      item: mediaList[index % mediaList.length]
    }));
  }, [mediaList]);

  useFrame(() => {
    // Update active video textures efficiently once per frame
    videoTextureManager.updateTextures();

    if (!groupRef.current) return;
    
    // Apply rotation velocity for full 360 degree rotation
    rotationState.current.x += velocityState.current.x;
    rotationState.current.y += velocityState.current.y;

    if (!isDragging.current) {
      // Momentum decay
      velocityState.current.x *= 0.92;
      velocityState.current.y *= 0.92;

      // Ambient idle rotation
      if (Date.now() - lastInteraction.current > 2000) {
        velocityState.current.y += 0.00015; 
      }
    } else {
      velocityState.current.x *= 0.3;
      velocityState.current.y *= 0.3;
    }

    groupRef.current.rotation.x = rotationState.current.x;
    groupRef.current.rotation.y = rotationState.current.y;
  });

  return (
    <group ref={groupRef}>
      {cardData.map((data, i) => (
        <Card 
          key={`${data.item.id}-${i}`} 
          index={i} 
          position={data.position} 
          scale={data.scale} 
          item={data.item} 
          onSelect={(selectedItem) => {
            if (!isDragging.current) {
              onSelect(selectedItem);
            }
          }}
          onHover={onHover}
          onHoverOut={onHoverOut}
        />
      ))}
    </group>
  );
}
