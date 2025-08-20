import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { SongCard } from '@/components/SongCard';
import { Song } from '@/types/music';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export const Categories: React.FC = () => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const songsRef = ref(database, 'songs');
    const unsubscribe = onValue(songsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const songsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllSongs(songsArray);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(songsArray.map(song => song.category))];
        setCategories(uniqueCategories);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSongs = selectedCategory 
    ? allSongs.filter(song => song.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Categories</h1>
        
        {!selectedCategory ? (
          // Categories Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(category => (
              <Card
                key={category}
                className="p-6 cursor-pointer bg-card hover:bg-music-hover transition-all duration-300 border-border/50 group"
                onClick={() => setSelectedCategory(category)}
              >
                <h3 className="text-lg font-semibold text-foreground capitalize text-center group-hover:text-primary transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {allSongs.filter(song => song.category === category).length} songs
                </p>
              </Card>
            ))}
          </div>
        ) : (
          // Category Songs
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground capitalize">
                {selectedCategory}
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-primary hover:text-primary/80 font-medium"
              >
                ← Back to Categories
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSongs.map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};