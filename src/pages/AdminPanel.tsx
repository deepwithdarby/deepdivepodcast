import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ref, push, set } from 'firebase/database';
import { auth, database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, LogOut, Upload, Plus } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [podcastData, setPodcastData] = useState({
    name: '',
    description: '',
    category: '',
    bannerUrl: '',
    audioUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPodcastData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const podcastsRef = ref(database, 'podcasts');
      const newPodcastRef = push(podcastsRef);
      
      await set(newPodcastRef, {
        ...podcastData,
        createdAt: Date.now()
      });

      toast({
        title: "Podcast uploaded successfully!",
        description: `"${podcastData.name}" has been added to the podcast library.`,
      });

      // Reset form
      setPodcastData({
        name: '',
        description: '',
        category: '',
        bannerUrl: '',
        audioUrl: ''
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload podcast",
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
              <Plus className="h-5 w-5" />
              Add New Podcast Episode
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
                <Label htmlFor="category" className="text-foreground">Category</Label>
                <Input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="e.g., technology, business, comedy"
                  value={podcastData.category}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerUrl" className="text-foreground">Cover Image URL</Label>
                <Input
                  id="bannerUrl"
                  name="bannerUrl"
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={podcastData.bannerUrl}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audioUrl" className="text-foreground">Audio File URL</Label>
                <Input
                  id="audioUrl"
                  name="audioUrl"
                  type="url"
                  placeholder="https://example.com/episode.mp3"
                  value={podcastData.audioUrl}
                  onChange={handleInputChange}
                  required
                  className="bg-input border-border focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload Episode'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};