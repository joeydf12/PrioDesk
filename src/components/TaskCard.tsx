import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, Project } from '@/types';
import { Calendar, Clock, ChevronRight, Sparkles, CheckCircle2, Upload, ChevronDown, ChevronUp, FileText, Image, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { TaskUploadDialog } from './TaskUploadDialog';

interface TaskCardProps {
  task: Task;
  projects: Project[];
  onComplete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onReschedule?: (taskId: string, newDate: string) => void;
  onTaskClick?: (task: Task) => void;
  showReschedule?: boolean;
  dailyTaskCapacity?: number; // Maximum number of tasks that can be done per day
  onDelete?: (taskId: string) => void;
  isOverdue?: boolean;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  onUpload?: (type: 'file' | 'image' | 'text', content: string, analysis: string) => void;
  tasks: Task[];
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
  dailyTaskCapacity = 7, // Default capacity of 7 tasks per day
  onDelete,
  isOverdue,
  isSelected,
  onSelect,
  onUpload,
  tasks,
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.planned_date || task.due_date);
  const [isAiRescheduling, setIsAiRescheduling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
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

  const handleCardClick = () => {
    if (onTaskClick) {
      onTaskClick(task);
    } else {
      setIsExpanded(!isExpanded);
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
      const taskScore = PRIORITY_SCORES[task.priority as keyof typeof PRIORITY_SCORES] || 1;

      // Begin vanaf morgen en zoek de eerste beschikbare dag
      let currentDate = new Date(tomorrow);
      let foundDate = false;

      // Zoek maximaal 30 dagen vooruit
      for (let i = 0; i < 30 && !foundDate; i++) {
        // Bereken hoeveel taken er al voor deze dag gepland staan
        const tasksForDay = tasks.filter(t => {
          const taskDate = t.planned_date || t.due_date;
          return new Date(taskDate).toDateString() === currentDate.toDateString() &&
            t.status !== 'completed';
        });

        // Bereken de totale prioriteitsscore voor deze dag
        const dayScore = tasksForDay.reduce((total, t) =>
          total + (PRIORITY_SCORES[t.priority as keyof typeof PRIORITY_SCORES] || 1), 0
        );

        // Als er nog ruimte is voor deze taak op deze dag
        if (dayScore + taskScore <= dailyTaskCapacity) {
          onReschedule(task.id, currentDate.toISOString());
          foundDate = true;
          toast({
            title: "Taak herpland",
            description: `De taak is verplaatst naar ${currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
          });
        } else {
          // Ga naar de volgende dag
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Als er geen beschikbare dag gevonden is binnen 30 dagen, plan dan op de laatste gecontroleerde dag
      if (!foundDate) {
        onReschedule(task.id, currentDate.toISOString());
        toast({
          title: "Taak herpland",
          description: `De taak is verplaatst naar ${currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}.`,
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

  const handleUpload = (type: 'file' | 'image' | 'text', content: string, analysis: string) => {
    onUpload(type, content, analysis);
    setIsUploadDialogOpen(false);
  };

  const formatAnalysis = (analysis: string) => {
    // Split the analysis into sections
    const sections = analysis.split('**').filter(Boolean);

    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          // Check if this is a header (ends with ":")
          const isHeader = section.trim().endsWith(':');
          const content = section.trim().replace(/:$/, '');

          if (isHeader) {
            return (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-sm">{content}</h4>
              </div>
            );
          }

          // Split content into bullet points if it contains "*"
          if (content.includes('*')) {
            const points = content.split('*').filter(Boolean);
            return (
              <ul key={index} className="list-disc pl-4 space-y-1">
                {points.map((point, pointIndex) => (
                  <li key={pointIndex} className="text-sm text-muted-foreground">
                    {point.trim()}
                  </li>
                ))}
              </ul>
            );
          }

          // Regular paragraph
          return (
            <p key={index} className="text-sm text-muted-foreground">
              {content}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={`group relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-slate-900 truncate">{task.title}</h3>
              {task.priority === 'high' && (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  Hoog
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {project && (
                <Badge variant="outline" className={project.color}>
                  {project.name}
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.effort}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm mt-3">
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
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm">
                      Gepland: {formatDate(task.planned_date || task.due_date)}
                    </span>
                    {task.planned_date && (
                      <span className="text-xs text-slate-500">
                        Deadline: {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
