import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock } from 'lucide-react';
import GalleryGlobe from './components/GalleryGlobe';
import IntroScreen from './components/IntroScreen';
import LocationDetailsScreen from './components/LocationDetailsScreen';
import LoadingOverlay from './components/LoadingOverlay';
import UploadModal from './components/UploadModal';
import TravelMovieModal from './components/TravelMovieModal';
import AdminProtectionModal, { isLocalhost } from './components/AdminProtectionModal';
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer';
import { MediaItem, DisplayMode, TravelReel } from './types';
import { DEFAULT_LANGKAWI_MEDIA } from './data';
import { getUserMediaItems, saveAllUserMedia, clearAllUserMedia, getTravelReel } from './utils/storage';

const DEFAULT_TRAVEL_REEL: TravelReel = {
  id: 'main_travel_reel',
  title: 'Langkawi 4K Experience Reel',
  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  location: 'Langkawi, Malaysia',
  description: 'Full cinematic travel video compilation featuring Langkawi beaches, Cable Car views, waterfalls, and tropical island adventures.',
  isCustom: false
};

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [userMedia, setUserMedia] = useState<MediaItem[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all');
  const [selectedCard, setSelectedCard] = useState<MediaItem | null>(null);
  const [isLoadingGlobe, setIsLoadingGlobe] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Full Travel Movie state
  const [travelReel, setTravelReel] = useState<TravelReel>(DEFAULT_TRAVEL_REEL);
  const [isMovieOpen, setIsMovieOpen] = useState(false);

  // Admin protection state for non-localhost environments
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminAction, setAdminAction] = useState<'start-over' | 'clear-all'>('start-over');

  // Full Screen Mode State (Triggered by Enter/OK on TV Remote & PC)
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard and TV Remote listener for Enter/OK and ESC/BACK keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key;
      const keyCode = e.keyCode;

      // ENTER or TV Remote OK Key
      const isEnterKey = 
        key === 'Enter' || 
        key === 'Select' || 
        key === 'OK' || 
        key === 'NumpadEnter' || 
        keyCode === 13;

      // ESCAPE or TV Remote BACK Key
      const isExitKey = 
        key === 'Escape' || 
        key === 'Backspace' || 
        key === 'GoBack' || 
        key === 'BrowserBack' || 
        keyCode === 27 || 
        keyCode === 8 || 
        keyCode === 10009 || // Samsung Tizen Return
        keyCode === 461;   // LG webOS Back

      if (isEnterKey) {
        if (hasStarted && !selectedCard && !isUploadModalOpen && !isMovieOpen && !isAdminModalOpen) {
          e.preventDefault();
          setIsFullscreen(true);
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }
      } else if (isExitKey) {
        if (isFullscreen) {
          e.preventDefault();
          setIsFullscreen(false);
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [hasStarted, isFullscreen, selectedCard, isUploadModalOpen, isMovieOpen, isAdminModalOpen]);

  const handleStartOverClick = () => {
    if (isLocalhost()) {
      setHasStarted(false);
    } else {
      setAdminAction('start-over');
      setIsAdminModalOpen(true);
    }
  };

  const handleProtectedClearAll = () => {
    if (isLocalhost()) {
      handleClearAll();
    } else {
      setAdminAction('clear-all');
      setIsAdminModalOpen(true);
    }
  };

  const handleConfirmAdminAction = () => {
    if (adminAction === 'start-over') {
      setHasStarted(false);
    } else if (adminAction === 'clear-all') {
      handleClearAll();
    }
  };

  // Restore saved user media and travel reel on mount from IndexedDB
  useEffect(() => {
    getUserMediaItems().then((items) => {
      if (items && items.length > 0) {
        setUserMedia(items);
      }
    });

    getTravelReel().then((savedReel) => {
      if (savedReel) {
        setTravelReel(savedReel);
      }
    });
  }, []);

  const handleStart = (initialMedia: MediaItem[], mode: DisplayMode) => {
    if (initialMedia.length > 0) {
      const merged = [...userMedia, ...initialMedia];
      setUserMedia(merged);
      saveAllUserMedia(merged);
    }
    setDisplayMode(mode);
    setHasStarted(true);
    setIsLoadingGlobe(true);
  };

  const handleAddMedia = (newItems: MediaItem[]) => {
    const updated = [...newItems, ...userMedia];
    setUserMedia(updated);
    saveAllUserMedia(updated);
  };

  const handleDeleteMedia = (id: string) => {
    const updated = userMedia.filter((item) => item.id !== id);
    setUserMedia(updated);
    saveAllUserMedia(updated);
  };

  const handleClearAll = () => {
    setUserMedia([]);
    clearAllUserMedia();
    setDisplayMode('all');
  };

  // Active media list rendered on the 3D sphere
  const activeMediaList = useMemo(() => {
    if (displayMode === 'only-uploaded') {
      return userMedia.length > 0 ? userMedia : DEFAULT_LANGKAWI_MEDIA;
    }
    return userMedia.length > 0 ? [...userMedia, ...DEFAULT_LANGKAWI_MEDIA] : DEFAULT_LANGKAWI_MEDIA;
  }, [displayMode, userMedia]);

  return (
    <div className="w-full h-full relative bg-white overflow-hidden select-none font-sans">
      {!hasStarted ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-50">
          <IntroScreen onStart={handleStart} />
        </div>
      ) : (
        <>
          <AnimatePresence>
            {isLoadingGlobe && (
              <motion.div
                key="loading-overlay"
                className="absolute inset-0 z-40 bg-white"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <LoadingOverlay onComplete={() => setIsLoadingGlobe(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ scale: 1, opacity: 0 }}
            animate={
              isLoadingGlobe 
                ? { scale: 1, opacity: 0 } 
                : { scale: selectedCard || isMovieOpen ? 0.85 : 1, opacity: selectedCard || isMovieOpen ? 0.25 : 1 }
            }
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 ${selectedCard || isMovieOpen ? 'pointer-events-none' : ''}`}
          >
            <GalleryGlobe 
              mediaList={activeMediaList}
              userMediaCount={userMedia.length}
              displayMode={displayMode}
              isFullscreen={isFullscreen}
              onSelect={(item) => setSelectedCard(item)}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onToggleDisplayMode={(mode) => setDisplayMode(mode)}
              onPlayFullMovie={() => setIsMovieOpen(true)}
              onToggleFullscreen={toggleFullscreen}
            />
          </motion.div>

          <AnimatePresence>
            {selectedCard && (
              <LocationDetailsScreen 
                key="location-details"
                item={selectedCard} 
                onClose={() => setSelectedCard(null)} 
              />
            )}
          </AnimatePresence>

          {/* Background Music Player featuring Justin Bieber hits */}
          <BackgroundMusicPlayer autoStart={true} isFullscreen={isFullscreen} />

          {/* Full Travel Movie Player Modal */}
          <TravelMovieModal
            isOpen={isMovieOpen}
            reel={travelReel}
            onClose={() => setIsMovieOpen(false)}
            onUpdateReel={(newReel) => setTravelReel(newReel)}
          />

          {/* Upload and Media Manager Modal */}
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            userMedia={userMedia}
            displayMode={displayMode}
            onAddMedia={handleAddMedia}
            onDeleteMedia={handleDeleteMedia}
            onClearAll={handleProtectedClearAll}
            onToggleDisplayMode={(mode) => setDisplayMode(mode)}
          />

          {/* Admin Protection Modal */}
          <AdminProtectionModal
            isOpen={isAdminModalOpen}
            actionTitle={adminAction === 'start-over' ? 'Start Over Restricted' : 'Clear All Media Restricted'}
            actionDescription={
              adminAction === 'start-over'
                ? "To prevent public visitors from accidentally resetting uploaded videos and photos on this app, 'Start Over' is locked to Localhost or requires Admin verification."
                : "To prevent public visitors from wiping out uploaded media, 'Clear All' is locked to Localhost or requires Admin verification."
            }
            onClose={() => setIsAdminModalOpen(false)}
            onConfirm={handleConfirmAdminAction}
          />

          {!isLoadingGlobe && !selectedCard && !isMovieOpen && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute bottom-6 left-6 flex items-center gap-4 z-30 pointer-events-auto"
            >
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="text-xs bg-gray-900 text-white hover:bg-black px-4 py-2.5 font-semibold tracking-wider uppercase transition-colors shadow-sm rounded-xl"
              >
                Manage Uploads ({userMedia.length})
              </button>
              
              <button 
                onClick={handleStartOverClick}
                className="text-[11px] text-gray-500 hover:text-gray-900 tracking-widest uppercase transition-colors flex items-center gap-1 py-1 px-2.5 rounded-lg border border-transparent hover:border-gray-200"
                title={isLocalhost() ? "Start Over (Localhost)" : "Start Over (Localhost / Admin Protected)"}
              >
                {!isLocalhost() && <Lock className="w-3 h-3 text-amber-600" />}
                <span>Start Over</span>
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

