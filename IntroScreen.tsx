import { ArrowRight, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';

interface IntroScreenProps {
  onStart: (initialMedia: MediaItem[], displayMode: 'only-uploaded' | 'all') => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const handleLaunch = () => {
    onStart([], 'all');
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-lg mx-auto p-6 font-sans text-center justify-between overflow-y-auto">
      
      <div className="my-auto py-6 w-full flex flex-col items-center">
        
        {/* Title & Tagline */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-widest rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Langkawi Travel Gallery
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-gray-900 leading-none">
            langkawi
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-3 tracking-wide max-w-sm mx-auto leading-relaxed">
            Explore the beauty of Langkawi through an interactive 3D travel sphere
          </p>
        </div>

        {/* Enter Button */}
        <div className="flex flex-col gap-3.5 w-full max-w-xs">
          <button 
            onClick={handleLaunch}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gray-900 hover:bg-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs font-semibold rounded-xl shadow-lg"
          >
            Enter Langkawi 3D Globe
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

      </div>

      <p className="text-[11px] text-gray-400 text-center w-full max-w-sm mt-4">
        Interactive 3D sphere experience featuring Langkawi island highlights and background music.
      </p>
    </div>
  );
}
