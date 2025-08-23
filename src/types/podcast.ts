export interface Podcast {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  audio_url: string;
  categories: string[];
  keywords: string[];
  name_lowercase: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PodcastContextType {
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  podcasts: Podcast[];
  categories: Category[];
  favorites: string[];
  play: (podcast: Podcast) => void;
  pause: () => void;
  resume: () => void;
  nextPodcast: () => void;
  previousPodcast: () => void;
  toggleFavorite: (podcastId: string) => void;
  isFavorite: (podcastId: string) => boolean;
}