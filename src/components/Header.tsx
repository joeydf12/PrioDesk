
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, FolderOpen, Calendar, Clock, Menu, X, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  onCreateTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTask }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/', icon: CheckSquare, label: 'Dashboard' },
    { path: '/tasks', icon: Clock, label: 'Taken' },
    { path: '/completed', icon: CheckSquare, label: 'Afgerond' },
    { path: '/planning', icon: Calendar, label: 'Planning' },
    { path: '/projects', icon: FolderOpen, label: 'Projecten' },
  ];

  const navItemsMobile = [
    { path: '/tasks', icon: Clock, label: 'Taken' },
    { path: '/completed', icon: CheckSquare, label: 'Afgerond' },
    { path: '/planning', icon: Calendar, label: 'Planning' },
    { path: '/projects', icon: FolderOpen, label: 'Projecten' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                TaskMind AI
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 ml-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={isActive(path) ? 'default' : 'ghost'}
                    size="sm"
                    className="transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}

            {/* Create Task Button */}
            <Button
              onClick={onCreateTask}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Taak Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
            <nav className="grid grid-cols-2 gap-2">
              {navItemsMobile.map(({ path, icon: Icon, label }) => (
                <Link key={path} to={path} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={isActive(path) ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
