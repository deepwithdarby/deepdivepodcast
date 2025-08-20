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
import { Categories } from "@/pages/Categories";
import { Favorites } from "@/pages/Favorites";
import { AdminLogin } from "@/pages/AdminLogin";
import { AdminPanel } from "@/pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminPanel />} />
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

export default App;
