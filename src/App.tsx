import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PodcastProvider } from "@/contexts/PodcastContext";
import { PodcastPlayer } from "@/components/PodcastPlayer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Home } from "@/pages/Home";
import { Search } from "@/pages/Search";
import { Landing } from "@/pages/Landing";
import { LoadingScreen } from "@/pages/LoadingScreen";
import { Categories } from "@/pages/Categories";
import { Favorites } from "@/pages/Favorites";

import { AdminPanel } from "@/pages/AdminPanel";
import { AdminLogin } from "@/pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [appState, setAppState] = React.useState<'landing' | 'loading' | 'app'>('landing');

  const handleGetStarted = () => {
    setAppState('loading');
  };

  const handleLoadingComplete = () => {
    setAppState('app');
    // Replace the current history entry to prevent back navigation to landing/loading
    window.history.replaceState(null, '', '/');
  };

  if (appState === 'landing') {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  if (appState === 'loading') {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PodcastProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="dark">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/favorites" element={<Favorites />} />
                
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
              <PodcastPlayer />
            </div>
          </BrowserRouter>
        </PodcastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
