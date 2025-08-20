import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Podcast, Category, PodcastContextType } from '@/types/podcast';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load podcasts from Firebase
  useEffect(() => {
    const podcastsRef = ref(database, 'podcasts');
    const unsubscribe = onValue(podcastsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const podcastsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setPodcasts(podcastsArray);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(podcastsArray.map(podcast => podcast.category)))
          .map(categoryName => ({
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName
          }));
        setCategories(uniqueCategories);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoritePodcasts');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoritePodcasts', JSON.stringify(favorites));
  }, [favorites]);

  const play = useCallback((podcast: Podcast) => {
    console.log('Play function called for podcast:', podcast.name, 'Audio URL:', podcast.audioUrl);
    if (audioRef.current) {
      setCurrentPodcast(podcast);
      audioRef.current.src = podcast.audioUrl;
      console.log('Audio src set to:', audioRef.current.src);
      audioRef.current.play().then(() => {
        console.log('Audio started playing successfully');
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
      });
    } else {
      console.error('Audio ref is null');
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentPodcast) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, [currentPodcast]);

  const nextPodcast = useCallback(() => {
    if (currentPodcast && podcasts.length > 0) {
      const currentIndex = podcasts.findIndex(p => p.id === currentPodcast.id);
      const nextIndex = (currentIndex + 1) % podcasts.length;
      play(podcasts[nextIndex]);
    }
  }, [currentPodcast, podcasts, play]);

  const previousPodcast = useCallback(() => {
    if (currentPodcast && podcasts.length > 0) {
      const currentIndex = podcasts.findIndex(p => p.id === currentPodcast.id);
      const previousIndex = currentIndex === 0 ? podcasts.length - 1 : currentIndex - 1;
      play(podcasts[previousIndex]);
    }
  }, [currentPodcast, podcasts, play]);

  // Initialize audio element
  useEffect(() => {
    console.log('Initializing audio element');
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleEnded = () => {
      console.log('Audio ended, playing next podcast');
      if (currentPodcast && podcasts.length > 0) {
        const currentIndex = podcasts.findIndex(p => p.id === currentPodcast.id);
        const nextIndex = (currentIndex + 1) % podcasts.length;
        play(podcasts[nextIndex]);
      }
    };

    const handleLoadedData = () => {
      console.log('Audio loaded data');
      if (isPlaying) {
        audio.play().catch(console.error);
      }
    };

    const handleError = (error: Event) => {
      console.error('Audio error:', error);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
    };
  }, [currentPodcast, podcasts, play, isPlaying]);

  const toggleFavorite = useCallback((podcastId: string) => {
    setFavorites(prev => 
      prev.includes(podcastId) 
        ? prev.filter(id => id !== podcastId)
        : [...prev, podcastId]
    );
  }, []);

  const isFavorite = useCallback((podcastId: string) => {
    return favorites.includes(podcastId);
  }, [favorites]);

  const value: PodcastContextType = {
    currentPodcast,
    isPlaying,
    podcasts,
    categories,
    favorites,
    play,
    pause,
    resume,
    nextPodcast,
    previousPodcast,
    toggleFavorite,
    isFavorite,
  };

  return (
    <PodcastContext.Provider value={value}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcast = () => {
  const context = useContext(PodcastContext);
  if (context === undefined) {
    throw new Error('usePodcast must be used within a PodcastProvider');
  }
  return context;
};