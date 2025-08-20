import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { usePodcast } from '@/contexts/PodcastContext';

export const PodcastPlayer: React.FC = () => {
  const { 
    currentPodcast, 
    isPlaying, 
    pause, 
    resume, 
    nextPodcast, 
    previousPodcast, 
    toggleFavorite, 
    isFavorite 
  } = usePodcast();

  if (!currentPodcast) return null;

  const handlePlayPause = () => {
    isPlaying ? pause() : resume();
  };

  const handleFavoriteToggle = () => {
    toggleFavorite(currentPodcast.id);
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border p-4">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        {/* Podcast Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img 
            src={currentPodcast.bannerUrl} 
            alt={currentPodcast.name}
            className="w-12 h-12 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground truncate">
              {currentPodcast.name}
            </h4>
            <p className="text-sm text-muted-foreground truncate">
              {currentPodcast.description}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={previousPodcast}
            size="icon"
            variant="ghost"
            className="h-10 w-10 text-foreground"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            size="icon"
            className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          
          <Button
            onClick={nextPodcast}
            size="icon"
            variant="ghost"
            className="h-10 w-10 text-foreground"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleFavoriteToggle}
            size="icon"
            variant="ghost"
            className="h-10 w-10 text-foreground"
          >
            <Heart 
              className={`h-5 w-5 ${
                isFavorite(currentPodcast.id) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-muted-foreground'
              }`} 
            />
          </Button>
        </div>
      </div>
    </Card>
  );
};