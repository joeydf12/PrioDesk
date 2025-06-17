import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, Project } from '@/types';
import { Calendar, Clock, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

interface TaskCardProps {
  task: Task;
  projects: Project[];
  onComplete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onReschedule?: (taskId: string, newDate: string) => void;
  onTaskClick?: (task: Task) => void;
  showReschedule?: boolean;
  dailyTaskCapacity?: number; // Maximum number of tasks that can be done per day
}

// Priority scoring system
const PRIORITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3
} as const;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  projects,
  onComplete,
  onTaskStatusChange,
  onReschedule,
  onTaskClick,
  showReschedule = false,
  dailyTaskCapacity = 7 // Default capacity of 7 tasks per day
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.due_date);
  const [isAiRescheduling, setIsAiRescheduling] = useState(false);
  const { toast } = useToast();

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

  const handleAiReschedule = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onReschedule) return;

    setIsAiRescheduling(true);
    try {
      // Simuleer AI suggestie
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      // Bereken de prioriteitsscore van de huidige taak
      const taskScore = PRIORITY_SCORES[task.priority as keyof typeof PRIORITY_SCORES] || 1;

      // Als de taak een hoge prioriteit heeft (score 3), plan deze voor morgen
      if (taskScore === 3) {
        onReschedule(task.id, tomorrow.toISOString());
        toast({
          title: "Taak herpland naar morgen",
          description: "Deze taak heeft een hoge prioriteit en is verplaatst naar morgen.",
        });
      } else {
        // Voor medium en lage prioriteit, plan voor overmorgen
        onReschedule(task.id, dayAfterTomorrow.toISOString());
        toast({
          title: "Taak herpland naar overmorgen",
          description: "De taak is verplaatst naar overmorgen om ruimte te maken voor taken met hogere prioriteit.",
        });
      }
    } catch (error) {
      toast({
        title: "Fout bij herplannen",
        description: "Er is een fout opgetreden bij het herplannen van de taak.",
        variant: "destructive",
      });
    } finally {
      setIsAiRescheduling(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer relative"
      onClick={handleCardClick}
    >
      <Button
        size="sm"
        variant={task.status === 'completed' ? "default" : "outline"}
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id);
        }}
        className={`absolute top-3 right-3 h-7 px-2 text-xs ${
          task.status === 'completed' 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 mr-1" />
        {task.status === 'completed' ? 'Terugzetten' : 'Afronden'}
      </Button>

      <div className="flex items-start justify-between mb-3 pr-20">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-slate-800 mb-1 text-sm sm:text-base truncate ${task.status === 'completed' ? '' : ''}`}>
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
      </div>
    </div>
  );
};
