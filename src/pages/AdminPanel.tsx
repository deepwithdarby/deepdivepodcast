import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, LogOut, Upload, Plus, Edit, Trash2 } from 'lucide-react';
import { Podcast } from '@/types/podcast';

export const AdminPanel: React.FC = () => {
  const [podcastData, setPodcastData] = useState({
    name: '',
    description: '',
    category: '',
    banner_url: '',
    audio_url: ''
  });
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPodcasts, setIsLoadingPodcasts] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        loadPodcasts();
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPodcasts(data || []);
    } catch (error) {
      console.error('Error loading podcasts:', error);
    } finally {
      setIsLoadingPodcasts(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const generateKeywords = (name: string, description: string, categories: string[]) => {
    const text = `${name} ${description} ${categories.join(' ')}`.toLowerCase();
    return [...new Set(text.match(/\b\w+\b/g) || [])];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPodcastData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setPodcastData({
      name: podcast.name,
      description: podcast.description,
      category: podcast.categories?.join(', ') || '',
      banner_url: podcast.banner_url,
      audio_url: podcast.audio_url
    });
  };

  const handleCancelEdit = () => {
    setEditingPodcast(null);
    setPodcastData({
      name: '',
      description: '',
      category: '',
      banner_url: '',
      audio_url: ''
    });
  };

  const handleDelete = async (podcastId: string, podcastName: string) => {
    if (!confirm(`Are you sure you want to delete "${podcastName}"?`)) return;

    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', podcastId);
      
      if (error) throw error;
      
      toast({
        title: "Podcast deleted",
        description: `"${podcastName}" has been deleted.`,
      });
      loadPodcasts();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete podcast",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const categories = podcastData.category.split(',').map(cat => cat.trim()).filter(Boolean);
      const keywords = generateKeywords(podcastData.name, podcastData.description, categories);
      
      const podcastPayload = {
        name: podcastData.name,
        description: podcastData.description,
        banner_url: podcastData.banner_url,
        audio_url: podcastData.audio_url,
        categories,
        keywords,
        name_lowercase: podcastData.name.toLowerCase()
      };

      if (editingPodcast) {
        const { error } = await supabase
          .from('podcasts')
          .update(podcastPayload)
          .eq('id', editingPodcast.id);
        
        if (error) throw error;
        
        toast({
          title: "Podcast updated successfully!",
          description: `"${podcastData.name}" has been updated.`,
        });
      } else {
        const { error } = await supabase
          .from('podcasts')
          .insert([podcastPayload]);
        
        if (error) throw error;
        
        toast({
          title: "Podcast uploaded successfully!",
          description: `"${podcastData.name}" has been added to the podcast library.`,
        });
      }

      // Reset form
      setPodcastData({
        name: '',
        description: '',
        category: '',
        banner_url: '',
        audio_url: ''
      });
      setEditingPodcast(null);
      loadPodcasts();
    } catch (error: any) {
      toast({
        title: editingPodcast ? "Update failed" : "Upload failed",
        description: error.message || `Failed to ${editingPodcast ? 'update' : 'upload'} podcast`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Mic className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Upload Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              {editingPodcast ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingPodcast ? 'Edit Podcast Episode' : 'Add New Podcast Episode'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Episode Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter episode name"
                  value={podcastData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter episode description"
                  value={podcastData.description}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Categories</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="e.g., technology, business, comedy (separate with commas)"
                  value={podcastData.category}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple categories with commas (e.g., "technology, science, education")
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner_url" className="text-foreground">Cover Image URL</Label>
                <Input
                  id="banner_url"
                  name="banner_url"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={podcastData.banner_url}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio_url" className="text-foreground">Audio File URL</Label>
                <Input
                  id="audio_url"
                  name="audio_url"
                  type="url"
                  placeholder="https://example.com/episode.mp3"
                  value={podcastData.audio_url}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {editingPodcast ? <Edit className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  {isLoading ? (editingPodcast ? 'Updating...' : 'Uploading...') : (editingPodcast ? 'Update Episode' : 'Upload Episode')}
                </Button>
                {editingPodcast && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Existing Podcasts */}
        <Card className="bg-card border-border mt-8">
          <CardHeader>
            <CardTitle className="text-foreground">Existing Podcasts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPodcasts ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading podcasts...</p>
              </div>
            ) : podcasts.length > 0 ? (
              <div className="space-y-4">
                {podcasts.map(podcast => (
                  <div key={podcast.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{podcast.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{podcast.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Categories: {podcast.categories?.join(', ') || 'No categories'}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(podcast)}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(podcast.id, podcast.name)}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No podcasts available yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};