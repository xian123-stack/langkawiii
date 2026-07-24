import { useState, useRef, useEffect } from 'react';
import { 
  X, Film, Image as ImageIcon, MapPin, Calendar, Share2, ExternalLink, 
  Check, Sparkles, HardDrive, Globe, Info, ZoomIn, ZoomOut, RotateCcw, Move
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { MediaItem } from '../types';

interface LocationDetailsProps {
  item: MediaItem;
  onClose: () => void;
}

export default function LocationDetailsScreen({ item, onClose }: LocationDetailsProps) {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [item.id]);

  const handleCopy = () => {
    const textToCopy = `${item.title} - ${item.location || 'Langkawi, Malaysia'}\n${window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenOriginal = () => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, +(prev + delta).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2.5);
    } else {
      handleResetZoom();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const formattedDate = item.createdAt 
    ? new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Langkawi Gallery';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/75 backdrop-blur-md"
    >
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white shadow-2xl flex flex-col md:flex-row w-full max-w-5xl h-[90vh] max-h-[760px] relative rounded-2xl z-10 overflow-hidden border border-slate-200/80"
      >
        {/* Floating Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-black text-white transition-all z-30 shadow-lg rounded-full backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Media Preview Container with Zoom & Pan */}
        <div 
          className={`w-full md:w-[52%] h-[42vh] md:h-full bg-slate-950 flex-shrink-0 relative overflow-hidden flex items-center justify-center group ${
            zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
          }`}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Zoomable Inner Media Wrapper */}
          <div 
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="w-full h-full flex items-center justify-center select-none pointer-events-auto"
          >
            {item.type === 'video' ? (
              <video 
                src={item.url} 
                controls={zoom === 1}
                autoPlay 
                loop 
                playsInline
                preload="auto"
                className="w-full h-full object-contain bg-slate-950 pointer-events-auto" 
              />
            ) : (
              <img 
                src={item.url} 
                alt={item.title} 
                draggable={false}
                className="w-full h-full object-contain bg-slate-950 pointer-events-auto" 
              />
            )}
          </div>

          {/* Media Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-none">
            <div className="px-3 py-1 bg-slate-900/85 text-white text-xs font-medium rounded-full flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-md">
              {item.type === 'video' ? (
                <>
                  <Film className="w-3.5 h-3.5 text-emerald-400" />
                  <span>HD Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>HD Photo</span>
                </>
              )}
            </div>

            {item.fileSize && (
              <div className="px-3 py-1 bg-slate-900/85 text-slate-200 text-xs font-mono rounded-full flex items-center gap-1 backdrop-blur-md border border-white/10 shadow-md">
                <HardDrive className="w-3 h-3 text-slate-400" />
                <span>{(item.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            )}
          </div>

          {/* Zoom Hint Overlay */}
          <div className="absolute top-4 right-16 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 text-slate-300 text-[11px] font-medium rounded-full backdrop-blur-md border border-white/10 opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none">
            {zoom > 1 ? (
              <>
                <Move className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Drag to pan image</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3 h-3 text-sky-400" />
                <span>Double-click or scroll to zoom</span>
              </>
            )}
          </div>

          {/* Floating Zoom Bar Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/90 text-white rounded-full border border-white/15 shadow-xl backdrop-blur-md">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 rounded-full hover:bg-slate-800 transition-all active:scale-90"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-slate-800/80 hover:bg-slate-800 rounded-md transition-colors"
              title="Click to reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 rounded-full hover:bg-slate-800 transition-all active:scale-90"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-amber-400 hover:text-amber-300 rounded-full hover:bg-slate-800 transition-all active:scale-90 ml-1 border-l border-slate-700/80 pl-2"
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Comfortable & Refined Detail Content */}
        <div className="w-full h-full md:w-[48%] flex flex-col bg-slate-50/50 divide-y divide-slate-100 overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-6 pb-4 sm:p-8 sm:pb-5 bg-white border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{item.location || 'Langkawi, Malaysia'}</span>
              </div>

              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {item.title}
            </h2>
          </div>

          {/* Scrollable Story & Details Section */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-slate-50/30">
            
            {/* Quick Metadata Pill Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Source</div>
                  <div className="text-xs font-semibold text-slate-800">
                    {item.isUserUploaded ? 'Your Upload' : 'Langkawi Featured'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quality</div>
                  <div className="text-xs font-semibold text-slate-800">Original HD</div>
                </div>
              </div>
            </div>

            {/* Markdown Info Content */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>About this Media</span>
              </div>
              <div className="font-sans text-slate-700 space-y-3 leading-relaxed text-sm sm:text-base [&>h1]:hidden [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-slate-900 [&>p]:text-slate-600 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:text-slate-600">
                <Markdown>{item.info || item.title}</Markdown>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 sm:px-8 bg-white border-t border-slate-100 flex-shrink-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                title="Copy location & title"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>

              <button
                onClick={handleOpenOriginal}
                className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                title="Open original media in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Original</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold tracking-wide rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Back to Globe
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

