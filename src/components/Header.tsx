import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, FolderOpen, Calendar, Clock, Menu, X, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HeaderProps {
  onCreateTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTask }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { path: '/tasks', icon: Clock, label: 'Taken' },
    { path: '/planning', icon: Calendar, label: 'Planning' },
    { path: '/profile', icon: User, label: 'Profiel' },
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
            <div className="flex items-center w-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="p-0 border-0 bg-transparent focus:outline-none"
                  aria-label="Ga naar home"
                >
                  <img
                    src="/src/images/logopriodesk.png"
                    alt="PrioDesk Logo"
                    className="w-9 h-8 sm:w-10 sm:h-10 object-contain cursor-pointer"
                  />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="p-0 border-0 bg-transparent focus:outline-none"
                  aria-label="Ga naar home"
                >
                  <span className="font-bold text-lg sm:text-xl text-[#263456]">PrioDesk</span>
                </button>
              </div>
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
            {/* Create Task Button */}
            <Button
              onClick={onCreateTask}
              className="bg-[#293365] hover:bg-[#1f2547] text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Taak Toevoegen</span>
              <span className="sm:hidden">Toevoegen</span>
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

      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>Nieuwe taak toevoegen</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
};
