import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song, MusicContextType } from '@/types/music';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load songs from Firebase
  useEffect(() => {
    const songsRef = ref(database, 'songs');
    const unsubscribe = onValue(songsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const songsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSongs(songsArray);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const savedFavorites = localStorage.getItem('musicFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('musicFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener('ended', nextSong);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', nextSong);
      }
    };
  }, []);

  const play = (song: Song) => {
    if (audioRef.current) {
      if (currentSong?.id !== song.id) {
        audioRef.current.src = song.audioUrl;
        setCurrentSong(song);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (currentSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      play(songs[nextIndex]);
    }
  };

  const previousSong = () => {
    if (currentSong && songs.length > 0) {
      const currentIndex = songs.findIndex(song => song.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      play(songs[prevIndex]);
    }
  };

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const isFavorite = (songId: string) => favorites.includes(songId);

  const value: MusicContextType = {
    currentSong,
    isPlaying,
    songs,
    categories,
    favorites,
    play,
    pause,
    resume,
    nextSong,
    previousSong,
    toggleFavorite,
    isFavorite,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};