import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { useMusic } from '@/contexts/MusicContext';
import { Song } from '@/types/music';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export const Home: React.FC = () => {
  const { songs } = useMusic();
  const [searchTerm, setSearchTerm] = useState('');
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);

  useEffect(() => {
    const songsRef = ref(database, 'songs');
    const unsubscribe = onValue(songsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const songsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setAllSongs(songsArray);
        // Get recent songs (last 5 uploaded)
        const sortedByDate = songsArray.sort((a, b) => b.createdAt - a.createdAt);
        setRecentSongs(sortedByDate.slice(0, 5));
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredSongs = allSongs.filter(song =>
    song.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-music-secondary bg-clip-text text-transparent mb-2">
            MelodyStream
          </h1>
          <p className="text-muted-foreground">Discover your next favorite song</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for songs..."
            className="pl-10 bg-card border-border focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Recently Released */}
        {!searchTerm && recentSongs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Recently Released</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentSongs.map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </section>
        )}

        {/* All Songs */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {searchTerm ? 'Search Results' : 'All Songs'}
          </h2>
          {filteredSongs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredSongs.map(song => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No songs found matching your search.' : 'No songs available yet.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};