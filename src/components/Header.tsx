
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onCreateTask: () => void;
  activeView: 'dashboard' | 'projects';
  onViewChange: (view: 'dashboard' | 'projects') => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTask, activeView, onViewChange }) => {
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
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('dashboard')}
                className="transition-all duration-200"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Tasks
              </Button>
              <Button
                variant={activeView === 'projects' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('projects')}
                className="transition-all duration-200"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Projects
              </Button>
            </nav>
          </div>

          <Button
            onClick={onCreateTask}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
};
