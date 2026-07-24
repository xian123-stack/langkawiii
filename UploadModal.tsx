import { useState, useRef } from 'react';
import { Upload, Camera, Trash2, X, Plus, Check, Film, Image as ImageIcon, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userMedia: MediaItem[];
  displayMode: 'only-uploaded' | 'all';
  onAddMedia: (items: MediaItem[]) => void;
  onDeleteMedia: (id: string) => void;
  onClearAll: () => void;
  onToggleDisplayMode: (mode: 'only-uploaded' | 'all') => void;
}

export default function UploadModal({
  isOpen,
  onClose,
  userMedia,
  displayMode,
  onAddMedia,
  onDeleteMedia,
  onClearAll,
  onToggleDisplayMode
}: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customLocation, setCustomLocation] = useState('Langkawi, Malaysia');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const newItems: MediaItem[] = [];

    Array.from(files).forEach((file, index) => {
      const isImage = file.type.startsWith('image/');

      if (!isImage) return;

      const objectUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const titleText = customTitle.trim() || cleanName || 'Langkawi Photo';
      const locText = customLocation.trim() || 'Langkawi, Malaysia';

      newItems.push({
        id: `user-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'image',
        url: objectUrl,
        fileBlob: file,
        fileSize: file.size,
        title: titleText,
        location: locText,
        info: `# ${titleText} 🌴\n\nUploaded Langkawi Travel Photo taken at ${locText}.`,
        isUserUploaded: true,
        createdAt: Date.now() + index
      });
    });

    if (newItems.length > 0) {
      onAddMedia(newItems);
      setCustomTitle('');
      setActiveTab('manage');
    }
    setIsProcessing(false);
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.error("Camera access failed", e);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const v = videoRef.current;
      const c = canvasRef.current;
      c.width = v.videoWidth || 640;
      c.height = v.videoHeight || 480;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL('image/jpeg', 0.9);
        const titleText = customTitle.trim() || 'Langkawi Camera Capture';
        const newItem: MediaItem = {
          id: `user-cam-${Date.now()}`,
          type: 'image',
          url: dataUrl,
          title: titleText,
          location: customLocation.trim() || 'Langkawi, Malaysia',
          info: `# ${titleText} 📸\n\nCaptured photo in Langkawi travel collection.`,
          isUserUploaded: true,
          createdAt: Date.now()
        };
        onAddMedia([newItem]);
        stopCamera();
        setActiveTab('manage');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 rounded-none overflow-hidden text-gray-900">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              Langkawi Photo Manager
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload and display your photos on the 3D sphere
            </p>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Mode Toggle Bar */}
        <div className="bg-emerald-50 border-b border-emerald-100 p-3 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
              Sphere View Mode:
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {displayMode === 'only-uploaded' ? 'Showing ONLY your uploaded photos' : 'Showing all photos'}
            </span>
          </div>

          <button
            onClick={() => onToggleDisplayMode(displayMode === 'only-uploaded' ? 'all' : 'only-uploaded')}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
              displayMode === 'only-uploaded'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {displayMode === 'only-uploaded' && <Check className="w-3.5 h-3.5" />}
            {displayMode === 'only-uploaded' ? 'Only My Uploads ON' : 'Show Only My Uploads'}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-gray-900 text-gray-900 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            Upload Photos
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('manage');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'manage'
                ? 'border-gray-900 text-gray-900 bg-gray-50'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            My Uploads ({userMedia.length})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {!isCameraActive ? (
                <>
                  {/* Title & Location optional inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                        Caption / Title (Optional)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Pantai Cenang Sunset"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                        Langkawi Location (Optional)
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Langkawi Sky Bridge"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-gray-900"
                      />
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFilesSelected(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center group"
                  >
                    <Upload className="w-10 h-10 text-gray-400 group-hover:text-gray-900 transition-colors mb-3" />
                    <p className="text-sm font-semibold text-gray-800">
                      Click or Drag & Drop Photos here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports JPG, PNG, WEBP, GIF, HEIC (Select multiple photos at once)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      className="flex-1 py-3 px-4 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      Browse Photos
                    </button>

                    <button
                      onClick={startCamera}
                      disabled={isProcessing}
                      className="flex-1 py-3 px-4 border border-gray-900 hover:bg-gray-100 text-gray-900 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>

                  {isProcessing && (
                    <div className="text-center py-2 text-xs font-mono text-emerald-700 animate-pulse">
                      Processing photos for 3D sphere...
                    </div>
                  )}

                  <input 
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={capturePhoto}
                      className="flex-1 py-3 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 border border-gray-400 text-gray-700 hover:bg-gray-100 text-xs font-semibold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              {userMedia.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">No photos uploaded yet</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                    Upload your Langkawi travel photos to render them across the 3D sphere gallery!
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-5 py-2.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                  >
                    Upload Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {userMedia.length} item{userMedia.length !== 1 ? 's' : ''} in collection
                    </span>
                    <button
                      onClick={onClearAll}
                      className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All Uploads
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userMedia.map((item) => (
                      <div 
                        key={item.id}
                        className="relative group border border-gray-200 bg-gray-50 overflow-hidden aspect-[3/4] flex flex-col justify-end"
                      >
                        {item.type === 'video' ? (
                          <video 
                            src={item.url} 
                            muted 
                            loop 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                            onMouseOver={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                          />
                        ) : (
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="absolute inset-0 w-full h-full object-contain bg-black"
                          />
                        )}

                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 rounded-sm">
                          {item.type === 'video' ? (
                            <>
                              <Film className="w-3 h-3 text-emerald-400" />
                              <span>Video</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3 h-3 text-sky-400" />
                              <span>Photo</span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => onDeleteMedia(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white transition-opacity shadow-md rounded-none"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="relative z-10 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                          <p className="text-xs font-semibold truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-300 truncate">{item.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            {displayMode === 'only-uploaded'
              ? 'Sphere is set to ONLY show your uploaded photos.'
              : 'Sphere shows default Langkawi spots + your uploads.'}
          </p>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-6 py-2 bg-gray-900 text-white hover:bg-black text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>

      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
