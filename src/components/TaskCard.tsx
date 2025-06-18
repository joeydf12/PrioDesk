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
  onUpload?: (taskId: string, type: 'file' | 'image' | 'text', content: string, analysis: string) => void;
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
}) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(task.due_date);
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

  const handleUpload = (type: 'file' | 'image' | 'text', content: string, analysis: string) => {
    if (onUpload) {
      onUpload(task.id, type, content, analysis);
    }
    setIsUploadDialogOpen(false);
    // Force a re-render by updating local state
    setShowAnalysis(false);
    setIsExpanded(true); // Keep expanded to show the new attachment
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
    <Card className={`relative ${isOverdue ? 'border-red-500' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div
        className="p-3 sm:p-4 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
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

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={task.status === 'completed' ? "default" : "outline"}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              className={`h-7 px-2 text-xs ${task.status === 'completed'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'border-slate-200 hover:border-slate-300'
                }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {task.status === 'completed' ? 'Terugzetten' : 'Afronden'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
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
              <span className="text-xs sm:text-sm">
                {task.planned_date ? (
                  <>
                    <span className="text-blue-600">Gepland: {formatDate(task.planned_date)}</span>
                    <span className="text-slate-400 ml-2">(Deadline: {formatDate(task.due_date)})</span>
                  </>
                ) : (
                  formatDate(task.due_date)
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-200">
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Details</h5>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium w-24">Status:</span>
                    <Badge variant="outline" className={`ml-2 ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {task.status === 'completed' ? 'Afgerond' : 'In behandeling'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium w-24">Prioriteit:</span>
                    <span className="ml-2">{task.priority}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-medium w-24">Inspanning:</span>
                    <span className="ml-2">{task.effort}</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Project</h5>
                {project ? (
                  <div className="flex items-center">
                    <Badge variant="outline" className={project.color}>
                      {project.name}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Geen project toegewezen</p>
                )}
              </div>
            </div>

            {task.notes && (
              <div>
                <h5 className="text-sm font-medium text-slate-700 mb-2">Notities</h5>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {task.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Upload bijlage
              </Button>
            </div>

            {task.analysis && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="font-medium text-gray-700">AI Analyse</span>
                  </div>
                  {showAnalysis ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>

                {showAnalysis && (
                  <div className="p-4 bg-white">
                    <div className="prose prose-sm max-w-none">
                      {formatAnalysis(task.analysis)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <div className="mt-4 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Attachments</h4>
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {attachment.type === 'file' && <FileText className="w-4 h-4" />}
                      {attachment.type === 'image' && <Image className="w-4 h-4" />}
                      {attachment.type === 'text' && <MessageSquare className="w-4 h-4" />}
                      <span className="text-sm font-medium capitalize">{attachment.type}</span>
                    </div>
                    {attachment.analysis && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium mb-2">Analysis</h5>
                        {formatAnalysis(attachment.analysis)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <TaskUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        taskId={task.id}
      />
    </Card>
  );
};