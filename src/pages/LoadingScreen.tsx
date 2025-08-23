import React, { useEffect } from 'react';
import logo from '@/assets/logo.png';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 6000); // 6 seconds loading

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo with rotating border */}
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/60 animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-b-primary/40 animate-spin animation-delay-300" style={{animationDirection: 'reverse'}}></div>
          <img 
            src={logo} 
            alt="DeepDive Podcast Logo" 
            className="w-20 h-20 object-contain relative z-10"
          />
        </div>
        
        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Welcome to deepdive podcast
          </h2>
          <p className="text-muted-foreground">
            Preparing your podcast experience...
          </p>
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce animation-delay-100"></div>
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce animation-delay-200"></div>
        </div>
      </div>
    </div>
  );
};