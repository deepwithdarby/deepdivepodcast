import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { PodcastCard } from '@/components/PodcastCard';
import { Podcast } from '@/types/podcast';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Folder } from 'lucide-react';

export const Categories: React.FC = () => {
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const podcastsRef = ref(database, 'podcasts');
    const unsubscribe = onValue(podcastsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const podcastsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllPodcasts(podcastsArray);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(podcastsArray.map(podcast => podcast.category))];
        setCategories(uniqueCategories);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredPodcasts = selectedCategory 
    ? allPodcasts.filter(podcast => podcast.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Folder className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        </div>
        
        {!selectedCategory ? (
          // Categories Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(category => (
              <Card
                key={category}
                className="p-6 cursor-pointer bg-card hover:bg-music-hover transition-all duration-300 border-border/50 group"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Folder className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors" />
                  <h3 className="text-lg font-semibold text-foreground capitalize group-hover:text-primary transition-colors">
                    {category}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {allPodcasts.filter(podcast => podcast.category === category).length} episodes
                </p>
              </Card>
            ))}
          </div>
        ) : (
          // Category Podcasts
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
              {filteredPodcasts.map(podcast => (
                <PodcastCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};