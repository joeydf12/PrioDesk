import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Home, User, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Taken' },
    { path: '/planning', icon: Calendar, label: 'Agenda' },
    { path: '/profile', icon: User, label: 'Profiel' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-sm md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2",
              isActive(path)
                ? "text-blue-600"
                : "text-slate-600 hover:text-blue-600"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}; 