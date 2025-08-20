import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, Grid3X3 } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/categories', icon: Grid3X3, label: 'Categories' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`
            }
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};