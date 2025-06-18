import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Task, Project } from '@/types';
import { Calendar, Clock, FileText } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projects,
  isOpen,
  onClose,
}) => {
  if (!task) return null;

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold pr-8">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 bg-white p-4 rounded-lg">
          {task.description && (
            <div>
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Beschrijving</span>
              </div>
              <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Prioriteit</span>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority} prioriteit
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Inspanning</span>
              <span className="text-slate-600 text-sm flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {getEffortIcon(task.effort)} {task.effort}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Deadline</span>
              <div className="flex items-center text-slate-600 text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(task.due_date)}
              </div>
            </div>

            {task.planned_date && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Gepland op</span>
                <div className="flex items-center text-blue-600 text-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(task.planned_date)}
                </div>
              </div>
            )}

            {project && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Project</span>
                <Badge variant="outline" className={project.color}>
                  {project.name}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <Badge variant="outline" className={
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
              }>
                {task.status === 'completed' ? 'Afgerond' :
                  task.status === 'in-progress' ? 'Bezig' :
                    task.status === 'overdue' ? 'Te laat' : 'Gepland'}
              </Badge>
            </div>
          </div>

          {task.notes && (
            <div>
              <div className="flex items-center mb-2">
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Notities</span>
              </div>
              <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                {task.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
