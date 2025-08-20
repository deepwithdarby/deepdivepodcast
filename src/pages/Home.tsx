import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Mic } from 'lucide-react';
import { PodcastCard } from '@/components/PodcastCard';
import { Podcast } from '@/types/podcast';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);
  const [searchedPodcasts, setSearchedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPodcasts = async () => {
      const q = query(collection(db, 'podcasts'), orderBy('createdAt', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const podcastsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Podcast[];
      setRecentPodcasts(podcastsArray);
    };

    fetchRecentPodcasts();
  }, []);

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      let q;
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        q = query(
          collection(db, 'podcasts'),
          orderBy('name_lowercase'),
          where('name_lowercase', '>=', lowerCaseSearchTerm),
          where('name_lowercase', '<=', lowerCaseSearchTerm + '\uf8ff')
        );
      } else {
        q = query(collection(db, 'podcasts'), orderBy('createdAt', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      const podcastsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Podcast[];
      setSearchedPodcasts(podcastsArray);
      setIsLoading(false);
    };

    const debounceFetch = setTimeout(() => {
      fetchPodcasts();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

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

        {/* All Podcasts / Search Results */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {searchTerm ? 'Search Results' : 'All Podcasts'}
          </h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading...</p>
            </div>
          ) : searchedPodcasts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchedPodcasts.map(podcast => (
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