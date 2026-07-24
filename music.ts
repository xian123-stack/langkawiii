export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  fallbackUrl?: string;
  duration?: string;
}

export const JUSTIN_BIEBER_PLAYLIST: Song[] = [
  {
    id: 'beauty_and_a_beat',
    title: 'Beauty and a Beat',
    artist: 'Justin Bieber ft. Nicki Minaj',
    album: 'Believe',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://archive.org/download/JustinBieberBeautyAndABeatFt.NickiMinaj/Justin%20Bieber%20-%20Beauty%20And%20A%20Beat%20ft.%20Nicki%20Minaj.mp3',
    fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_tc9_110_4.mp3',
    duration: '3:48'
  },
  {
    id: 'eenie_meenie',
    title: 'Eenie Meenie',
    artist: 'Sean Kingston & Justin Bieber',
    album: 'My World 2.0',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://archive.org/download/SeanKingstonJustinBieberEenieMeenie_201701/Sean%20Kingston%2C%20Justin%20Bieber%20-%20Eenie%20Meenie.mp3',
    fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.mp3',
    duration: '3:22'
  },
  {
    id: 'love_yourself',
    title: 'Love Yourself',
    artist: 'Justin Bieber',
    album: 'Purpose',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://archive.org/download/JustinBieberLoveYourself/Justin%20Bieber%20-%20Love%20Yourself.mp3',
    fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/p31_4.mp3',
    duration: '3:53'
  },
  {
    id: 'sorry',
    title: 'Sorry',
    artist: 'Justin Bieber',
    album: 'Purpose',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://archive.org/download/JustinBieberSorry_201605/Justin%20Bieber%20-%20Sorry.mp3',
    fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-demos/ricochet_action.mp3',
    duration: '3:20'
  },
  {
    id: 'peaches',
    title: 'Peaches',
    artist: 'Justin Bieber ft. Daniel Caesar & Giveon',
    album: 'Justice',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://archive.org/download/JustinBieberPeaches/Justin%20Bieber%20-%20Peaches.mp3',
    fallbackUrl: 'https://commondatastorage.googleapis.com/codeskulptor-assets/sounddogs/soundtrack.mp3',
    duration: '3:18'
  }
];
