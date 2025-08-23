import React, { useEffect, useState } from 'react';
import { PodcastCard } from '@/components/PodcastCard';
import { usePodcast } from '@/contexts/PodcastContext';
import { Podcast } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';
import { Heart } from 'lucide-react';

export const Favorites: React.FC = () => {
  const { favorites } = usePodcast();
  const [favoritePodcasts, setFavoritePodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritePodcasts = async () => {
      setIsLoading(true);
      if (favorites.length === 0) {
        setFavoritePodcasts([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .in('id', favorites);

      if (error) {
        console.error('Error fetching favorite podcasts:', error);
        setFavoritePodcasts([]);
      } else {
        setFavoritePodcasts(data || []);
      }
      setIsLoading(false);
    };

    fetchFavoritePodcasts();
  }, [favorites]);

  return (
    <div className="min-h-screen bg-background p-4 pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-foreground">Your Favorites</h1>
        </div>
        
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading favorites...</p>
          </div>
        ) : favoritePodcasts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favoritePodcasts.map(podcast => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground">
              Start exploring podcasts and tap the heart icon to add them to your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};