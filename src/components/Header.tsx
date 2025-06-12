
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, FolderOpen, Calendar, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  onCreateTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTask }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                TaskMind AI
              </h1>
            </div>
            
            <nav className="flex items-center space-x-2 ml-8">
              <Link to="/">
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/tasks">
                <Button
                  variant={isActive('/tasks') ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Taken
                </Button>
              </Link>
              <Link to="/completed">
                <Button
                  variant={isActive('/completed') ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Afgerond
                </Button>
              </Link>
              <Link to="/planning">
                <Button
                  variant={isActive('/planning') ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Planning
                </Button>
              </Link>
              <Link to="/projects">
                <Button
                  variant={isActive('/projects') ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all duration-200"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Projecten
                </Button>
              </Link>
            </nav>
          </div>

          <Button
            onClick={onCreateTask}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Taak Toevoegen
          </Button>
        </div>
      </div>
    </header>
  );
};
