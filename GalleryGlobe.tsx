import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLOBE_RADIUS } from '../data';
import Globe from './Globe';
import { MediaItem } from '../types';
import { Upload, Sparkles, Filter, Layers, Play, Film, Maximize2, Minimize2, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const DEFAULT_CAMERA_Z = isMobile ? 28.8 : 19.8;

function CameraController({ targetZ }: { targetZ: React.MutableRefObject<number> }) {
  useFrame((state) => {
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z, 
      targetZ.current, 
      0.05
    );
  });
  return null;
}

interface GalleryGlobeProps {
  mediaList: MediaItem[];
  userMediaCount: number;
  displayMode: 'only-uploaded' | 'all';
  isFullscreen?: boolean;
  onSelect: (item: MediaItem) => void;
  onOpenUploadModal: () => void;
  onToggleDisplayMode: (mode: 'only-uploaded' | 'all') => void;
  onPlayFullMovie?: () => void;
  onToggleFullscreen?: () => void;
}

export default function GalleryGlobe({ 
  mediaList, 
  userMediaCount, 
  displayMode, 
  isFullscreen = false,
  onSelect, 
  onOpenUploadModal, 
  onToggleDisplayMode,
  onPlayFullMovie,
  onToggleFullscreen
}: GalleryGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const targetZ = useRef(DEFAULT_CAMERA_Z);
  const rotationState = useRef({ x: 0, y: 0 });
  const velocityState = useRef({ x: 0, y: 0.002 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const lastInteractionTime = useRef(Date.now() - 3000);
  const pointerPos = useRef({ x: 0, y: 0 });

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tooltipInfo, setTooltipInfo] = useState<string | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const parseTooltip = (info: string) => {
    if (!info) return '';
    const lines = info.split('\n');
    if (lines.length > 0) {
      let firstLine = lines[0].trim();
      if (firstLine.startsWith('#')) {
        firstLine = firstLine.substring(1).trim();
      }
      return firstLine;
    }
    return '';
  };

  const handleSpinAndPlay = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    lastInteractionTime.current = Date.now() + 5000;
    
    // Rapidly spin the sphere in 3D space
    velocityState.current = { x: 0.04, y: 0.18 };
    targetZ.current = isMobile ? 18 : 13;

    setTimeout(() => {
      if (onPlayFullMovie) {
        onPlayFullMovie();
      }
      setIsSpinning(false);
      targetZ.current = DEFAULT_CAMERA_Z;
      velocityState.current = { x: 0, y: 0.002 };
    }, 1300);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      lastInteractionTime.current = Date.now();
      const delta = e.deltaY;
      targetZ.current += delta * 0.015;
      targetZ.current = Math.max(-GLOBE_RADIUS * 0.8, Math.min(isMobile ? 35 : 28, targetZ.current));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    setIsMouseDown(true);
    lastMouse.current = { x: e.clientX, y: e.clientY };
    lastInteractionTime.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    pointerPos.current = { x: e.clientX, y: e.clientY };
    if (tooltipRef.current) {
      tooltipRef.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
    }

    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    
    velocityState.current.y += deltaX * 0.005;
    velocityState.current.x += deltaY * 0.005;
    
    lastInteractionTime.current = Date.now();
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setIsMouseDown(false);
    lastInteractionTime.current = Date.now();
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full relative select-none ${isMouseDown ? 'cursor-grabbing' : 'cursor-grab'}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top Floating Control Bar (Hidden in Full Screen Mode) */}
      {!isFullscreen ? (
        <div className="absolute top-6 left-6 right-6 z-40 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 border border-gray-200 shadow-sm rounded-xl">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-900">
              Langkawi 3D Travel Sphere
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode toggle button */}
            <button
              onClick={() => onToggleDisplayMode(displayMode === 'only-uploaded' ? 'all' : 'only-uploaded')}
              className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md transition-all shadow-sm border rounded-xl ${
                displayMode === 'only-uploaded'
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white/90 text-gray-800 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {displayMode === 'only-uploaded' ? (
                <Filter className="w-3.5 h-3.5 text-white" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-gray-600" />
              )}
              <span>
                {displayMode === 'only-uploaded' ? 'Only My Uploads' : 'All Photos'}
              </span>
              {userMediaCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${
                  displayMode === 'only-uploaded' ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-800'
                }`}>
                  {userMediaCount}
                </span>
              )}
            </button>

            {/* Upload photos button */}
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors rounded-xl"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Photos
            </button>

            {/* Fullscreen Toggle Button */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors rounded-xl"
                title="Enter Full Screen Mode (Press ENTER / OK on Remote)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
                <span className="text-[10px] bg-emerald-800/80 px-1.5 py-0.5 rounded font-mono">ENTER / OK</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Full Screen Active - Exit Hint Overlay */
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-3 bg-slate-950/85 text-white px-5 py-2.5 rounded-full border border-slate-700/80 shadow-2xl backdrop-blur-xl"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
            <Tv className="w-4 h-4 text-emerald-400" />
            <span>Immersive Sphere Mode</span>
            <span className="text-slate-400 text-[11px] font-mono border-l border-slate-700 pl-2">
              Press <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">ESC</kbd> or <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">BACK</kbd> to exit
            </span>
          </div>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="ml-2 p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
              title="Exit Full Screen"
            >
              <Minimize2 className="w-4 h-4 text-rose-400" />
            </button>
          )}
        </motion.div>
      )}

      <Canvas 
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace
        }}
        camera={{ position: [0, 0, DEFAULT_CAMERA_Z], fov: 45, near: 0.1 }}
      >
        <CameraController targetZ={targetZ} />
        <Suspense fallback={null}>
          <Globe 
            mediaList={mediaList}
            rotationState={rotationState}
            velocityState={velocityState}
            isDragging={isDragging}
            lastInteraction={lastInteractionTime}
            onSelect={onSelect}
            onHover={(info) => setTooltipInfo(parseTooltip(info))}
            onHoverOut={() => setTooltipInfo(null)}
          />
        </Suspense>
      </Canvas>

      {/* Spinning Sphere Transition Overlay */}
      <AnimatePresence>
        {isSpinning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="px-6 py-4 bg-slate-950/90 text-white rounded-2xl border border-emerald-500/50 shadow-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin flex items-center justify-center">
                <Film className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-wide">Spinning Sphere...</div>
                <div className="text-xs text-emerald-400 font-medium">Launching Full Travel Film</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Right Floating Play Button (Hidden in Full Screen Mode) */}
      {!isFullscreen && (
        <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
          <button
            onClick={handleSpinAndPlay}
            disabled={isSpinning}
            className="group relative flex items-center gap-3 px-5 py-3 bg-slate-900/90 hover:bg-black text-white rounded-2xl shadow-2xl border border-emerald-500/50 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 hover:border-emerald-400 hover:shadow-emerald-500/20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:bg-emerald-400 transition-colors pl-0.5">
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Play Full Reel</span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Full HD Travel Movie</div>
            </div>
          </button>
        </div>
      )}

      {/* Tooltip Overlay */}
      {tooltipInfo && !isSpinning && (
        <div
          ref={tooltipRef}
          className="pointer-events-none fixed top-0 left-0 z-50 bg-black text-white px-4 py-2 rounded-full font-sans text-xs font-medium whitespace-nowrap shadow-xl"
          style={{ 
            borderRadius: '32px',
            willChange: 'transform',
            transform: `translate(${pointerPos.current.x + 16}px, ${pointerPos.current.y + 16}px)`
          }}
        >
          {tooltipInfo}
        </div>
      )}
    </div>
  );
}

