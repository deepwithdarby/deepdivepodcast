import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Mic } from 'lucide-react';
import { PodcastCard } from '@/components/PodcastCard';
import { usePodcast } from '@/contexts/PodcastContext';
import { Podcast } from '@/types/podcast';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export const Home: React.FC = () => {
  const { podcasts } = usePodcast();
  const [searchTerm, setSearchTerm] = useState('');
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);

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
        // Get recent podcasts (last 5 uploaded)
        const sortedByDate = podcastsArray.sort((a, b) => b.createdAt - a.createdAt);
        setRecentPodcasts(sortedByDate.slice(0, 5));
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredPodcasts = allPodcasts.filter(podcast =>
    podcast.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mic className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-music-secondary bg-clip-text text-transparent">
              deepdive podcast
            </h1>
          </div>
          <p className="text-muted-foreground text-center">Discover your next favorite podcast episode</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for podcasts..."
            className="pl-10 bg-card border-border focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Recently Released */}
        {!searchTerm && recentPodcasts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Recently Released</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentPodcasts.map(podcast => (
                <PodcastCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          </section>
        )}

        {/* All Podcasts */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {searchTerm ? 'Search Results' : 'All Podcasts'}
          </h2>
          {filteredPodcasts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPodcasts.map(podcast => (
                <PodcastCard key={podcast.id} podcast={podcast} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No podcasts found matching your search.' : 'No podcasts available yet.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};