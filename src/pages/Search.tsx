import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Mic } from 'lucide-react';
import { PodcastCard } from '@/components/PodcastCard';
import { Podcast } from '@/types/podcast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedPodcasts, setSearchedPodcasts] = useState<Podcast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPodcasts = async () => {
      if (!searchTerm.trim()) {
        setSearchedPodcasts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const q = query(
        collection(db, 'podcasts'),
        orderBy('name_lowercase'),
        where('name_lowercase', '>=', lowerCaseSearchTerm),
        where('name_lowercase', '<=', lowerCaseSearchTerm + '\uf8ff')
      );

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