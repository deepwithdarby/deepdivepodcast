import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react';
import { useMusic } from '@/contexts/MusicContext';

export const MusicPlayer: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    pause, 
    resume, 
    nextSong, 
    previousSong, 
    toggleFavorite, 
    isFavorite 
  } = useMusic();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Song Info */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <img 
            src={currentSong.bannerUrl} 
            alt={currentSong.name}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="min-w-0">
            <h4 className="font-medium text-foreground truncate">{currentSong.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{currentSong.description}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={previousSong}
            size="icon"
            variant="ghost"
            className="text-foreground hover:text-primary"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={isPlaying ? pause : resume}
            size="icon"
            className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </Button>
          
          <Button
            onClick={nextSong}
            size="icon"
            variant="ghost"
            className="text-foreground hover:text-primary"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Favorite */}
        <div className="flex justify-end flex-1">
          <Button
            onClick={() => toggleFavorite(currentSong.id)}
            size="icon"
            variant="ghost"
            className="text-foreground hover:text-primary"
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite(currentSong.id) ? 'fill-red-500 text-red-500' : ''}`} 
            />
          </Button>
        </div>
      </div>
    </div>
  );
};