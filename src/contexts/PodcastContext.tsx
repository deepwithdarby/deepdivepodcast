import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Podcast, Category, PodcastContextType } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';

const PodcastContext = createContext<PodcastContextType | undefined>(undefined);

export const PodcastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Refs to always have latest values in event listeners
  const currentRef = useRef<Podcast | null>(null);
  const podcastsRef = useRef<Podcast[]>([]);
  const isPlayingRef = useRef(false);

  // Load podcasts from Supabase
  useEffect(() => {
    const fetchPodcasts = async () => {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching podcasts:', error);
        return;
      }
      
      setPodcasts(data || []);
      
      // Extract unique categories
      const allCategories = new Set<string>();
      data?.forEach(podcast => {
        if (podcast.categories && Array.isArray(podcast.categories)) {
          podcast.categories.forEach(cat => allCategories.add(cat));
        }
      });
      
      const uniqueCategories = Array.from(allCategories)
        .map(categoryName => ({
          id: categoryName.toLowerCase().replace(/\s+/g, '-'),
          name: categoryName
        }));
      setCategories(uniqueCategories);
    };

    fetchPodcasts();
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

  // Keep refs in sync with latest state
  useEffect(() => { currentRef.current = currentPodcast; }, [currentPodcast]);
  useEffect(() => { podcastsRef.current = podcasts; }, [podcasts]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const play = useCallback((podcast: Podcast) => {
    console.log('Play function called for podcast:', podcast.name, 'Audio URL:', podcast.audio_url);
    if (audioRef.current) {
      setCurrentPodcast(podcast);
      audioRef.current.src = podcast.audio_url;
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

  // Initialize audio element once
  useEffect(() => {
    console.log('Initializing audio element');
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      console.log('Audio ended, playing next podcast');
      const curr = currentRef.current;
      const list = podcastsRef.current;
      if (curr && list.length > 0) {
        const currentIndex = list.findIndex(p => p.id === curr.id);
        const nextIndex = (currentIndex + 1) % list.length;
        play(list[nextIndex]);
      }
    };

    const handleLoadedData = () => {
      console.log('Audio loaded data');
      if (isPlayingRef.current) {
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
  }, []);

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