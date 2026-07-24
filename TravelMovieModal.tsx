import { useState, useRef, useEffect } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Upload, Film, 
  Edit3, Check, Sparkles, HardDrive, RefreshCw, Music, MapPin, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TravelReel } from '../types';
import { saveTravelReel } from '../utils/storage';

interface TravelMovieModalProps {
  isOpen: boolean;
  reel: TravelReel;
  onClose: () => void;
  onUpdateReel: (newReel: TravelReel) => void;
}

export default function TravelMovieModal({
  isOpen,
  reel,
  onClose,
  onUpdateReel
}: TravelMovieModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editTitle, setEditTitle] = useState(reel.title || 'Langkawi 4K Travel Film');
  const [editLocation, setEditLocation] = useState(reel.location || 'Langkawi, Malaysia');
  const [editDescription, setEditDescription] = useState(
    reel.description || 'Full cinematic travel video compilation featuring Langkawi beaches, waterfalls, and island adventures.'
  );

  useEffect(() => {
    setEditTitle(reel.title || 'Langkawi 4K Travel Film');
    setEditLocation(reel.location || 'Langkawi, Malaysia');
    setEditDescription(
      reel.description || 'Full cinematic travel video compilation featuring Langkawi beaches, waterfalls, and island adventures.'
    );
  }, [reel]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [isOpen, reel.url]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (!duration && videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec) || timeInSec === 0) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (e.g., .mp4, .mov, .webm)');
      return;
    }

    const newUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

    const newReel: TravelReel = {
      id: 'main_travel_reel',
      title: cleanName || 'My Custom Langkawi Reel',
      url: newUrl,
      fileBlob: file,
      fileSize: file.size,
      location: editLocation,
      description: editDescription,
      isCustom: true,
    };

    saveTravelReel(newReel);
    onUpdateReel(newReel);
    setIsEditing(false);
  };

  const handleSaveDetails = () => {
    const updated: TravelReel = {
      ...reel,
      title: editTitle,
      location: editLocation,
      description: editDescription
    };
    saveTravelReel(updated);
    onUpdateReel(updated);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl"
      >
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-950 text-white w-full max-w-6xl h-[92vh] max-h-[820px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative z-10 flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-40 p-2.5 bg-slate-900/80 hover:bg-black text-white rounded-full border border-white/20 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Close video"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Full HD Video Player Stage */}
          <div className="w-full md:w-[65%] h-[50vh] md:h-full bg-black relative flex flex-col justify-between overflow-hidden group">
            
            {/* The Video Element */}
            <video
              ref={videoRef}
              src={reel.url}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              loop
              playsInline
              preload="auto"
            />

            {/* Top Bar Overlay inside Video */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md">
                  <Film className="w-3.5 h-3.5 text-emerald-400" />
                  Full Travel Reel (1080p HD)
                </span>
                {reel.isCustom && (
                  <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-medium backdrop-blur-md">
                    Custom Reel
                  </span>
                )}
              </div>
            </div>

            {/* Floating Play Indicator when paused */}
            {!isPlaying && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 backdrop-blur-[2px] cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-2xl pl-1 hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-10 h-10 fill-slate-950" />
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent z-20 space-y-3 opacity-95 transition-opacity">
              {/* Scrubbing timeline */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-300 w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700/70 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <span className="text-[11px] font-mono text-slate-400 w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Action bar buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={toggleMute}
                      className="p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFullscreen}
                    className="p-2 text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Travel Reel Details & Clip Editor */}
          <div className="w-full md:w-[35%] h-full bg-slate-900 border-l border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              
              {/* Header Title */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Travel Movie Reel</span>
                  </div>

                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Clip'}</span>
                  </button>
                </div>

                {!isEditing ? (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {reel.title || 'Langkawi 4K Travel Film'}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{reel.location || 'Langkawi, Malaysia'}</span>
                    </p>
                  </>
                ) : (
                  <div className="space-y-3 mt-3">
                    <div>
                      <label className="text-[11px] uppercase font-bold text-slate-400">Movie Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 mt-1"
                        placeholder="e.g. Langkawi Vacation 2026"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase font-bold text-slate-400">Location Tag</label>
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 mt-1"
                        placeholder="e.g. Langkawi, Malaysia"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload New Full Clip Section */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-emerald-400" />
                    <span>Custom Full Travel Clip</span>
                  </span>
                  {reel.fileSize && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {(reel.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your full edited travel video or clip reel to show when clicking the Play button.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Custom Full Reel</span>
                </button>
              </div>

              {/* Movie Description */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                <label className="text-[11px] uppercase font-bold text-slate-400">Movie Story & Info</label>
                {!isEditing ? (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {reel.description || 'Full cinematic travel video compilation featuring Langkawi beaches, waterfalls, and island adventures.'}
                  </p>
                ) : (
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 mt-1 resize-none"
                  />
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-4">
              {isEditing ? (
                <button
                  onClick={handleSaveDetails}
                  className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Close Player
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
