import { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Music, Disc, ChevronUp, ChevronDown, ListMusic, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JUSTIN_BIEBER_PLAYLIST, Song } from '../data/music';

interface BackgroundMusicPlayerProps {
  autoStart?: boolean;
  isFullscreen?: boolean;
}

export default function BackgroundMusicPlayer({ autoStart = true, isFullscreen = false }: BackgroundMusicPlayerProps) {
  const [playlist] = useState<Song[]>(JUSTIN_BIEBER_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = playlist[currentIndex];

  // Auto-play and song sync effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    if (autoStart) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
            setAudioError(false);
          })
          .catch((err) => {
            console.log('Autoplay blocked by browser policy:', err);
            setAutoplayBlocked(true);
            setIsPlaying(false);
          });
      }
    }
  }, [currentIndex, autoStart]);

  // First user interaction listener to unblock autoplay if needed
  useEffect(() => {
    if (!autoplayBlocked) return;

    const handleFirstUserInteraction = () => {
      if (audioRef.current && autoplayBlocked) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, [autoplayBlocked]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          setAudioError(false);
        })
        .catch(() => {
          setAutoplayBlocked(true);
        });
    }
  };

  // Handle Track Navigation
  const handleNextTrack = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setAudioError(false);
  };

  const handlePrevTrack = () => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setAudioError(false);
  };

  // Handle Song End -> Automatic Looping
  const handleSongEnded = () => {
    // Continuous playlist loop
    handleNextTrack();
  };

  // Handle Audio Error
  const handleAudioError = () => {
    if (!audioError && currentSong.fallbackUrl && audioRef.current) {
      setAudioError(true);
      audioRef.current.src = currentSong.fallbackUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      // If error persists, jump to next song
      handleNextTrack();
    }
  };

  // Volume Changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  };

  if (isFullscreen) return null; // Hide floating bar during fullscreen mode

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
      {/* Hidden HTML Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        preload="auto"
        onEnded={handleSongEnded}
        onError={handleAudioError}
      />

      {/* Autoplay Unmute Prompt Banner */}
      <AnimatePresence>
        {autoplayBlocked && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            onClick={togglePlay}
            className="mb-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg border border-emerald-400 flex items-center gap-2 animate-bounce cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse text-amber-300" />
            <span>Click anywhere to enable Justin Bieber Music 🎵</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Music Player Bar */}
      <motion.div
        layout
        className="bg-slate-900/90 text-white rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl overflow-hidden"
      >
        {/* Compact View Header */}
        <div className="p-2.5 flex items-center gap-3">
          {/* Vinyl Disc Icon */}
          <div 
            onClick={togglePlay}
            className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 p-0.5 cursor-pointer flex-shrink-0 group shadow-md"
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Disc className={`w-5 h-5 text-emerald-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                  <Play className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity pl-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Song Info & Equalizer */}
          <div className="flex-1 min-w-[140px] max-w-[200px] cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Music className="w-3 h-3 text-emerald-400" />
                <span>JB Music</span>
              </span>

              {/* Animated Equalizer */}
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3 ml-1">
                  <motion.span animate={{ height: ['20%', '100%', '40%'] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-emerald-400 rounded-full" />
                  <motion.span animate={{ height: ['80%', '30%', '90%'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-emerald-400 rounded-full" />
                  <motion.span animate={{ height: ['40%', '90%', '20%'] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-emerald-400 rounded-full" />
                </div>
              )}
            </div>

            <div className="text-xs font-bold text-slate-100 truncate mt-0.5">
              {currentSong.title}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentSong.artist}
            </div>
          </div>

          {/* Quick Play Control Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevTrack}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-transform active:scale-90"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 pl-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Expand / Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand Controls'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-800 px-3.5 py-3 space-y-3 bg-slate-950/60"
            >
              {/* Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />

                <span className="text-[10px] font-mono text-slate-400 min-w-[32px] text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Playlist Drawer Toggle */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Playlist ({currentIndex + 1}/5)</span>
                </button>

                <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded-full">
                  Auto-Loop Active
                </span>
              </div>

              {/* Songs List */}
              {showPlaylist && (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 pt-1">
                  {playlist.map((song, idx) => (
                    <button
                      key={song.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsPlaying(true);
                        if (audioRef.current) {
                          audioRef.current.play().catch(() => {});
                        }
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        idx === currentIndex
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}.</span>
                        <div className="truncate">
                          <p className="truncate font-medium">{song.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{song.duration}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
