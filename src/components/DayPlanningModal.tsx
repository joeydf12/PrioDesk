import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskCard } from './TaskCard';
import { Task, Project } from '@/types';
import { Calendar } from 'lucide-react';

interface DayPlanningModalProps {
  date: Date | null;
  tasks: Task[];
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onTaskComplete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onTaskClick?: (task: Task) => void;
  onUpload?: (taskId: string, type: 'file' | 'image' | 'text', content: string, analysis: string) => void;
  onEdit?: (taskId: string, updatedTask: Partial<Task>) => void;
}

export const DayPlanningModal: React.FC<DayPlanningModalProps> = ({
  date,
  tasks,
  projects,
  isOpen,
  onClose,
  onTaskComplete,
  onTaskStatusChange,
  onTaskClick,
  onUpload,
  onEdit,
}) => {
  if (!date) return null;

  const selectedDateString = date.toISOString().slice(0, 10);
  console.log('Selected date string:', selectedDateString);

  const dayTasks = tasks.filter(task => {
    if (!task.planned_date) return false;
    const plannedDateString = task.planned_date.slice(0, 10);
    console.log('Task planned date:', {
      taskId: task.id,
      title: task.title,
      plannedDate: task.planned_date,
      plannedDateString,
      selectedDateString,
      matches: plannedDateString === selectedDateString
    });
    return plannedDateString === selectedDateString;
  });

  console.log('Filtered tasks for day:', dayTasks);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Planning voor {formatDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {dayTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Geen taken gepland</h3>
              <p className="text-slate-500">Er staan geen taken gepland voor deze dag</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {dayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onComplete={onTaskComplete}
                  onTaskStatusChange={onTaskStatusChange}
                  onTaskClick={onTaskClick}
                  onUpload={onUpload}
                  onEdit={onEdit}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
