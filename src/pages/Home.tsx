import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Mic } from 'lucide-react';
import { PodcastCard } from '@/components/PodcastCard';
import { Podcast } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);
  const [allPodcasts, setAllPodcasts] = useState<Podcast[]>([]);
  const [searchedPodcasts, setSearchedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPodcasts = useCallback(async (loadMore = false) => {
    if (loadMore && !hasMore) return;
    
    setIsLoading(!loadMore);
    setIsLoadingMore(loadMore);

    try {
      let query = supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (loadMore && lastDoc) {
        query = query.lt('created_at', lastDoc);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading podcasts:', error);
        return;
      }

      const podcastsArray = data || [];

      if (loadMore) {
        setAllPodcasts(prev => [...prev, ...podcastsArray]);
      } else {
        setAllPodcasts(podcastsArray);
        setRecentPodcasts(podcastsArray.slice(0, 5));
      }

      setLastDoc(podcastsArray.length > 0 ? podcastsArray[podcastsArray.length - 1].created_at : null);
      setHasMore(podcastsArray.length === 20);
    } catch (error) {
      console.error('Error loading podcasts:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [lastDoc, hasMore]);

  useEffect(() => {
    loadPodcasts();
  }, []);

  useEffect(() => {
    const searchPodcasts = async () => {
      if (!searchTerm.trim()) {
        setSearchedPodcasts([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
        const podcastMap = new Map<string, { podcast: Podcast; matches: number }>();

        for (const word of searchWords) {
          const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .contains('keywords', [word]);

          if (error) {
            console.error('Error searching podcasts:', error);
            continue;
          }

          data?.forEach(podcast => {
            const existing = podcastMap.get(podcast.id);
            if (existing) {
              existing.matches++;
            } else {
              podcastMap.set(podcast.id, { podcast, matches: 1 });
            }
          });
        }

        const sortedPodcasts = Array.from(podcastMap.values())
          .sort((a, b) => b.matches - a.matches)
          .map(item => item.podcast);

        setSearchedPodcasts(sortedPodcasts);
      } catch (error) {
        console.error('Error searching podcasts:', error);
        setSearchedPodcasts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      searchPodcasts();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchTerm]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (!searchTerm && hasMore && !isLoadingMore) {
          loadPodcasts(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchTerm, hasMore, isLoadingMore, loadPodcasts]);

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
          {isLoading && (!searchTerm ? allPodcasts.length === 0 : true) ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading...</p>
            </div>
          ) : (searchTerm ? searchedPodcasts : allPodcasts).length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(searchTerm ? searchedPodcasts : allPodcasts).map(podcast => (
                  <PodcastCard key={podcast.id} podcast={podcast} />
                ))}
              </div>
              {!searchTerm && isLoadingMore && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading more podcasts...</p>
                </div>
              )}
            </>
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