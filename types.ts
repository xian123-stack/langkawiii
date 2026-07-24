export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  fileBlob?: Blob;
  fileSize?: number;
  duration?: number;
  title: string;
  location: string;
  info: string;
  isUserUploaded?: boolean;
  createdAt?: number;
}

export interface TravelReel {
  id: string;
  title: string;
  url: string;
  fileBlob?: Blob;
  fileSize?: number;
  duration?: string;
  location?: string;
  description?: string;
  isCustom?: boolean;
}

export type DisplayMode = 'only-uploaded' | 'all';
