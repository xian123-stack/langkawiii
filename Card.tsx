import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect } from 'react';
import { CARD_WIDTH, CARD_HEIGHT, GLOBE_RADIUS } from '../data';
import { MediaItem } from '../types';
import { videoTextureManager } from '../utils/videoManager';

interface CardProps {
  index: number;
  position: THREE.Vector3;
  scale?: number;
  item: MediaItem;
  onSelect: (item: MediaItem) => void;
  onHover?: (info: string) => void;
  onHoverOut?: () => void;
}

function createVideoPosterCanvas(item: MediaItem): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Sleek dark luxury background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1200);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#090d16');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 900, 1200);

    // 2. Subtle grid lines for technological aesthetic
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 2;
    for (let x = 0; x < 900; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1200);
      ctx.stroke();
    }
    for (let y = 0; y < 1200; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(900, y);
      ctx.stroke();
    }

    // 3. Top HD Video Badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 3;
    const badgeW = 260;
    const badgeH = 54;
    const badgeX = 50;
    const badgeY = 60;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 27);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎬 HD VIDEO', badgeX + 35, badgeY + badgeH / 2);

    // 4. Center Play Button Graphic
    const centerX = 450;
    const centerY = 520;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.fill();

    // Middle circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 95, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Play Triangle
    ctx.beginPath();
    ctx.moveTo(centerX - 22, centerY - 38);
    ctx.lineTo(centerX + 42, centerY);
    ctx.lineTo(centerX - 22, centerY + 38);
    ctx.closePath();
    ctx.fillStyle = '#020617';
    ctx.fill();

    // 5. Title & Location Info Box at bottom
    const cardBottomGrad = ctx.createLinearGradient(0, 750, 0, 1200);
    cardBottomGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
    cardBottomGrad.addColorStop(0.4, 'rgba(2, 6, 23, 0.85)');
    cardBottomGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
    ctx.fillStyle = cardBottomGrad;
    ctx.fillRect(0, 750, 900, 450);

    // Location tag
    ctx.fillStyle = '#34d399';
    ctx.font = '600 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📍 ${item.location || 'Langkawi, Malaysia'}`, centerX, 920);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    
    let titleText = item.title || 'Travel Video';
    if (titleText.length > 26) {
      titleText = titleText.substring(0, 24) + '...';
    }
    ctx.fillText(titleText, centerX, 990);

    // Call to action pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    const ctaW = 440;
    const ctaH = 54;
    const ctaX = centerX - ctaW / 2;
    const ctaY = 1055;
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaY, ctaW, ctaH, 27);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('CLICK TO PLAY VIDEO', centerX, ctaY + ctaH / 2);

    // Outer card border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 892, 1192);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export default function Card({ index, position, scale = 1, item, onSelect, onHover, onHoverOut }: CardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;

    // Default placeholder texture while loading
    const grayCanvas = document.createElement('canvas');
    grayCanvas.width = 400;
    grayCanvas.height = 500;
    const gCtx = grayCanvas.getContext('2d');
    if (gCtx) {
      gCtx.fillStyle = '#E5E5E5';
      gCtx.fillRect(0, 0, 400, 500);
    }
    const initialTex = new THREE.CanvasTexture(grayCanvas);
    initialTex.minFilter = THREE.LinearFilter;
    initialTex.generateMipmaps = false;
    setTexture(initialTex);

    if (!item || !item.url) return;

    if (item.type === 'video') {
      // Lazy load video: render high-performance video poster texture on the sphere.
      // Video streams & loads ONLY when clicked into!
      const posterTex = createVideoPosterCanvas(item);
      if (active) {
        setTexture(posterTex);
      }
      return () => {
        active = false;
        posterTex.dispose();
      };
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!active) return;
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 1200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill sleek frame background
          ctx.fillStyle = '#0d0d10';
          ctx.fillRect(0, 0, 900, 1200);

          const imgAspect = img.width / img.height;
          const canvasAspect = 900 / 1200; // 0.75

          let drawW = 900;
          let drawH = 1200;
          let offsetX = 0;
          let offsetY = 0;

          if (imgAspect > canvasAspect) {
            drawH = 900 / imgAspect;
            offsetY = (1200 - drawH) / 2;
          } else {
            drawW = 1200 * imgAspect;
            offsetX = (900 - drawW) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

          // Subtle inset border
          ctx.strokeStyle = '#27272a';
          ctx.lineWidth = 4;
          ctx.strokeRect(2, 2, 896, 1196);
        }

        const loadedTex = new THREE.CanvasTexture(canvas);
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTex.magFilter = THREE.LinearFilter;
        loadedTex.anisotropy = 16;
        loadedTex.generateMipmaps = true;
        loadedTex.needsUpdate = true;
        setTexture(loadedTex);
      };
      img.onerror = (err) => {
        console.error("Failed to load image texture for card", item.id, err);
      };
      img.src = item.url;
      return () => {
        active = false;
      };
    }
  }, [item.url, item.type, item.id, item.title, item.location]);

  useEffect(() => {
    if (hovered && item && onHover) {
      onHover(item.info || item.title);
    }
  }, [item, hovered, onHover]);

  const rotationQuaternion = useMemo(() => {
    const dummy = new THREE.Object3D();
    dummy.position.copy(position);
    dummy.lookAt(position.clone().multiplyScalar(2));
    return dummy.quaternion.clone();
  }, [position]);

  const geometry = useMemo(() => {
    const width = CARD_WIDTH * scale;
    const height = CARD_HEIGHT * scale;
    const geo = new THREE.PlaneGeometry(width, height, 32, 32);
    const pos = geo.attributes.position;
    
    // Curve the plane to match the sphere's surface
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      
      const theta = x / GLOBE_RADIUS;
      const phi = y / GLOBE_RADIUS;
      
      const newX = GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi);
      const newY = GLOBE_RADIUS * Math.sin(phi);
      const newZ = GLOBE_RADIUS * Math.cos(theta) * Math.cos(phi) - GLOBE_RADIUS;
      
      pos.setXYZ(i, newX, newY, newZ);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [scale]);

  return (
    <mesh 
      position={position} 
      quaternion={rotationQuaternion}
      ref={meshRef} 
      geometry={geometry} 
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        if (item && onHover) {
          onHover(item.info || item.title);
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
        if (onHoverOut) {
          onHoverOut();
        }
      }}
    >
      {texture && (
        <meshBasicMaterial 
          map={texture} 
          side={THREE.DoubleSide} 
          toneMapped={false} 
        />
      )}
    </mesh>
  );
}
