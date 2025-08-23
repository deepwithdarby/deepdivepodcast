import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Mic } from 'lucide-react';
import { PodcastCard } from '@/components/PodcastCard';
import { Podcast } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';

export const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedPodcasts, setSearchedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchPodcasts = async () => {
      if (!searchTerm.trim()) {
        setSearchedPodcasts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
        const podcastMap = new Map<string, { podcast: Podcast; matches: number }>();

        // Search in multiple fields for better results
        const searchQuery = searchWords.join(' ');
        
        // Search by keywords (exact match)
        const keywordPromises = searchWords.map(word => 
          supabase
            .from('podcasts')
            .select('*')
            .contains('keywords', [word])
        );
        
        // Search by name and description (fuzzy match)
        const textSearchPromise = supabase
          .from('podcasts')
          .select('*')
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,name_lowercase.ilike.%${searchQuery}%`);
        
        // Search by categories
        const categoryPromises = searchWords.map(word =>
          supabase
            .from('podcasts')
            .select('*')
            .contains('categories', [word])
        );

        const allPromises = [...keywordPromises, textSearchPromise, ...categoryPromises];
        const results = await Promise.all(allPromises);

        results.forEach((result, index) => {
          if (result.error) {
            console.error('Error searching podcasts:', result.error);
            return;
          }

          result.data?.forEach(podcast => {
            const existing = podcastMap.get(podcast.id);
            let scoreBoost = 1;
            
            // Give higher scores for different types of matches
            if (index === keywordPromises.length) {
              // Text search gets medium boost
              scoreBoost = 2;
            } else if (index < keywordPromises.length) {
              // Keyword matches get highest boost
              scoreBoost = 3;
            } else {
              // Category matches get medium boost
              scoreBoost = 2;
            }
            
            if (existing) {
              existing.matches += scoreBoost;
            } else {
              podcastMap.set(podcast.id, { podcast, matches: scoreBoost });
            }
          });
        });

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

  return (
    <div className="min-h-screen bg-background p-4 pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Search Podcasts</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for podcasts, episodes, or categories..."
            className="pl-10 bg-card border-border focus:border-primary text-lg py-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        {searchTerm && (
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Searching...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {searchedPodcasts.length} result{searchedPodcasts.length !== 1 ? 's' : ''} for "{searchTerm}"
                </h2>
                {searchedPodcasts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {searchedPodcasts.map(podcast => (
                      <PodcastCard key={podcast.id} podcast={podcast} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      No podcasts found matching "{searchTerm}"
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try searching for different keywords
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Popular suggestions when no search */}
        {!searchTerm && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">Popular Categories</h2>
            <div className="flex flex-wrap gap-2">
              {['technology', 'business', 'comedy', 'education', 'news', 'health'].map(term => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-4 py-2 bg-card hover:bg-music-hover border border-border rounded-full text-sm text-foreground transition-colors duration-200 capitalize"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};