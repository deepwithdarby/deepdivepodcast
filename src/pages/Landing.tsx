import React from 'react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

interface LandingProps {
  onGetStarted: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src={logo} 
            alt="DeepDive Podcast Logo" 
            className="w-32 h-32 object-contain"
          />
        </div>
        
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-music-secondary bg-clip-text text-transparent">
            deepdive podcast
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover and stream your favorite podcasts
          </p>
          <p className="text-muted-foreground">
            Dive deep into conversations that matter. Explore thousands of podcasts across every category imaginable.
          </p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              🎧
            </div>
            <p>High Quality Audio</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              📱
            </div>
            <p>Mobile Friendly</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              🔍
            </div>
            <p>Smart Search</p>
          </div>
        </div>
        
        {/* CTA Button */}
        <Button 
          onClick={onGetStarted}
          size="lg"
          className="px-12 py-6 text-lg font-semibold bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};