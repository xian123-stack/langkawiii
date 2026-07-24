import { MediaItem } from './types';

export const GLOBE_RADIUS = 6.0;
export const CARD_WIDTH = 1.8;
export const CARD_HEIGHT = 2.4;
export const TOTAL_CARDS = 48;

// Curated default Langkawi travel locations with high quality photos and sample videos
export const DEFAULT_LANGKAWI_MEDIA: MediaItem[] = [
  {
    id: 'langkawi-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=90',
    title: 'Langkawi Sky Bridge',
    location: 'Gunung Mat Cincang, Langkawi',
    info: '# Langkawi Sky Bridge, Malaysia 🇲🇾\n\nSuspended 660 meters above sea level at the peak of Gunung Mat Cincang, the 125-meter curved pedestrian cable-stayed Sky Bridge offers breathtaking 360-degree panoramic views of the Andaman Sea and surrounding islets.',
    isUserUploaded: false,
    createdAt: 1
  },
  {
    id: 'langkawi-2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90',
    title: 'Pantai Cenang Sunset',
    location: 'Pantai Cenang, Langkawi',
    info: '# Pantai Cenang Beach, Langkawi 🌅\n\nPantai Cenang is Langkawi’s most popular beach, famous for its vibrant golden sunsets, powdery white sand, thrill-seeking watersports, and beachside cafes.',
    isUserUploaded: false,
    createdAt: 2
  },
  {
    id: 'langkawi-3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=1200&q=90',
    title: 'Eagle Square (Dataran Lang)',
    location: 'Kuah Jetty, Langkawi',
    info: '# Eagle Square (Dataran Lang), Langkawi 🦅\n\nFeaturing a majestic 12-meter-tall sculpture of a reddish-brown eagle poised for flight, Dataran Lang is Langkawi’s most iconic landmark welcoming visitors arriving by sea at Kuah Jetty.',
    isUserUploaded: false,
    createdAt: 3
  },
  {
    id: 'langkawi-4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=90',
    title: 'Kilim Karst Geoforest Park',
    location: 'Kampung Kilim, Langkawi',
    info: '# Kilim Karst Geoforest Park, Langkawi 🌿\n\nA UNESCO Global Geopark featuring ancient vertical limestone karsts, dense mangrove forests, bat caves, and floating fish farms teeming with wildlife.',
    isUserUploaded: false,
    createdAt: 4
  },
  {
    id: 'langkawi-5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=90',
    title: 'Tanjung Rhu Crystal Waters',
    location: 'Tanjung Rhu, Langkawi',
    info: '# Tanjung Rhu Beach, Langkawi 🏝️\n\nLocated at the northern tip of Langkawi, Tanjung Rhu offers pristine white sands, peaceful sapphire waters, and towering limestone stacks rising dramatically out of the ocean.',
    isUserUploaded: false,
    createdAt: 5
  },
  {
    id: 'langkawi-6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=90',
    title: 'Telaga Tujuh Waterfalls',
    location: 'Seven Wells Waterfall, Langkawi',
    info: '# Telaga Tujuh (Seven Wells Waterfall) 🌊\n\nNamed after seven interconnected natural pools fed by seven separate waterfalls. According to local folklore, fairies used to bathe in these magical rainforest pools.',
    isUserUploaded: false,
    createdAt: 6
  },
  {
    id: 'langkawi-7',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=90',
    title: 'Dayang Bunting Lake',
    location: 'Pulau Dayang Bunting, Langkawi',
    info: '# Lake of the Pregnant Maiden (Tasik Dayang Bunting) ⛰️\n\nA serene freshwater lake surrounded by dense rainforest hills that resemble the outline of a pregnant woman lying on her back.',
    isUserUploaded: false,
    createdAt: 7
  },
  {
    id: 'langkawi-8',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=90',
    title: 'Panorama SkyCab Ride',
    location: 'Oriental Village, Langkawi',
    info: '# Panorama Langkawi SkyCab 缆车 🚠\n\nOne of the steepest cable car rides in the world, carrying visitors up Mount Machinchang through misty ancient rainforest canopy to the upper station.',
    isUserUploaded: false,
    createdAt: 8
  },
  {
    id: 'langkawi-9',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=90',
    title: 'Pantai Tengah Watersports',
    location: 'Pantai Tengah, Langkawi',
    info: '# Pantai Tengah, Langkawi 🚤\n\nA serene stretch of beach south of Pantai Cenang, popular for catamaran island hopping, parasailing, and sunset dinner cruises across the Andaman Sea.',
    isUserUploaded: false,
    createdAt: 9
  },
  {
    id: 'langkawi-10',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=90',
    title: 'Gunung Raya Peak',
    location: 'Gunung Raya, Langkawi',
    info: '# Gunung Raya Peak, Langkawi ⛰️\n\nAt 881 meters above sea level, Gunung Raya is the highest peak in Langkawi, covered in lush rainforest inhabited by hornbills, eagles, and macaque monkeys.',
    isUserUploaded: false,
    createdAt: 10
  }
];
