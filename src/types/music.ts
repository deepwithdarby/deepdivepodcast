export interface Song {
  id: string;
  name: string;
  description: string;
  category: string;
  bannerUrl: string;
  audioUrl: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  songs: Song[];
  categories: Category[];
  favorites: string[];
  play: (song: Song) => void;
  pause: () => void;
  resume: () => void;
  nextSong: () => void;
  previousSong: () => void;
  toggleFavorite: (songId: string) => void;
  isFavorite: (songId: string) => boolean;
}