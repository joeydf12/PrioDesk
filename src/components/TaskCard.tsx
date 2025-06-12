
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, Project } from '@/types';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TaskCardProps {
  task: Task;
  projects: Project[];
  onComplete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onReschedule?: (taskId: string, newDate: string) => void;
  onTaskClick?: (task: Task) => void;
  showReschedule?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projects,
  onComplete,
  onTaskStatusChange,
  onReschedule,
  onTaskClick,
  showReschedule = false
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.due_date);

  const project = projects.find(p => p.id === task.project_id);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case 'small': return '●';
      case 'medium': return '●●';
      case 'large': return '●●●';
      default: return '●';
    }
  };

  const handleRescheduleSubmit = () => {
    if (onReschedule) {
      onReschedule(task.id, newDate);
      setIsRescheduling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Morgen';
    if (diffDays === -1) return 'Gisteren';
    if (diffDays < 0) return `${Math.abs(diffDays)} dagen te laat`;
    if (diffDays <= 7) return `Over ${diffDays} dagen`;
    
    return date.toLocaleDateString();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on checkbox or buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-checkbox]')) {
      return;
    }
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="mt-1" data-checkbox>
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => {
                if (task.status !== 'completed') {
                  onComplete(task.id);
                }
              }}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-slate-800 mb-1 text-sm sm:text-base truncate ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-slate-600 text-xs sm:text-sm mb-2 line-clamp-2">{task.description}</p>
            )}
            
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                {task.priority}
              </Badge>
              
              {project && (
                <Badge variant="outline" className={`${project.color} text-xs`}>
                  {project.name}
                </Badge>
              )}
              
              <span className="text-slate-500 text-xs flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {getEffortIcon(task.effort)} {task.effort}
              </span>
            </div>
          </div>
        </div>
        
        {onTaskClick && (
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-slate-600">
          <Calendar className="w-4 h-4 mr-1" />
          {isRescheduling ? (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-7 text-xs w-32"
              />
              <Button size="sm" onClick={handleRescheduleSubmit} className="h-7 px-2 text-xs">
                Opslaan
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsRescheduling(false)}
                className="h-7 px-2 text-xs"
              >
                Annuleren
              </Button>
            </div>
          ) : (
            <span className="text-xs sm:text-sm">{formatDate(task.due_date)}</span>
          )}
        </div>

        {showReschedule && !isRescheduling && task.status !== 'completed' && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={(e) => {
              e.stopPropagation();
              setIsRescheduling(true);
            }}
            className="text-xs h-7"
          >
            Herplannen
          </Button>
        )}
      </div>
    </div>
  );
};
