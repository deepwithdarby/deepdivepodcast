export interface Podcast {
  id: string;
  name: string;
  description: string;
  category?: string;
  categories?: string[];
  keywords?: string[];
  bannerUrl: string;
  audioUrl: string;
  createdAt: number;
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