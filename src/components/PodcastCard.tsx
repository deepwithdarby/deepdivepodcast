import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause } from 'lucide-react';
import { Podcast } from '@/types/podcast';
import { usePodcast } from '@/contexts/PodcastContext';

interface PodcastCardProps {
  podcast: Podcast;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast }) => {
  const { currentPodcast, isPlaying, play, pause, resume, toggleFavorite, isFavorite } = usePodcast();
  
  const isCurrentPodcast = currentPodcast?.id === podcast.id;
  const isCurrentlyPlaying = isCurrentPodcast && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentPodcast) {
      isPlaying ? pause() : resume();
    } else {
      play(podcast);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(podcast.id);
  };

  return (
    <Card className="group relative overflow-hidden bg-card hover:bg-music-hover transition-all duration-300 cursor-pointer border-border/50">
      <div className="aspect-square relative">
        <img 
          src={podcast.bannerUrl} 
          alt={podcast.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={handlePlayPause}
            size="icon"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
          >
            {isCurrentlyPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>
        </div>
        <Button
          onClick={handleFavoriteToggle}
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 hover:bg-black/70"
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite(podcast.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </Button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 truncate">{podcast.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{podcast.description}</p>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{podcast.category}</p>
      </div>
    </Card>
  );
};