import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskStats } from './TaskStats';
import { Task, Project } from '@/types';
import { Button } from './ui/button';
import { Calendar, Sparkles, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

interface TaskDashboardProps {
  tasks: Task[];
  projects: Project[];
  onTaskComplete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onReschedule: (taskId: string, newDate: string) => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  tasks,
  projects,
  onTaskComplete,
  onTaskStatusChange,
  onReschedule,
  onTaskClick
}) => {
  const [selectedOverdueTasks, setSelectedOverdueTasks] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAiRescheduling, setIsAiRescheduling] = useState(false);
  const { toast } = useToast();

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return task.status !== 'completed' && dueDate < today;
  });

  const handleSelectAll = () => {
    if (selectedOverdueTasks.length === overdueTasks.length) {
      setSelectedOverdueTasks([]);
    } else {
      setSelectedOverdueTasks(overdueTasks.map(task => task.id));
    }
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedOverdueTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkReschedule = () => {
    if (!selectedDate) return;
    
    const newDate = selectedDate.toISOString();
    selectedOverdueTasks.forEach(taskId => {
      onReschedule(taskId, newDate);
    });
    
    setSelectedOverdueTasks([]);
    setIsCalendarOpen(false);
  };

  const handleAiReschedule = async () => {
    if (selectedOverdueTasks.length === 0) return;

    setIsAiRescheduling(true);
    try {
      // Simuleer AI suggestie (in een echte implementatie zou dit een API call zijn)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Voor nu: stel de datum in op morgen
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const newDate = tomorrow.toISOString();

      selectedOverdueTasks.forEach(taskId => {
        onReschedule(taskId, newDate);
      });

      toast({
        title: "Taken herpland",
        description: "AI heeft de geselecteerde taken herpland naar een optimale datum.",
      });

      setSelectedOverdueTasks([]);
    } catch (error) {
      toast({
        title: "Fout bij herplannen",
        description: "Er is een fout opgetreden bij het herplannen van de taken.",
        variant: "destructive",
      });
    } finally {
      setIsAiRescheduling(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* { Stats } */}
      {/* <TaskStats 
        totalTasks={tasks.length}
        completedTasks={tasks.filter(t => t.status === 'completed').length}
        overdueTasks={overdueTasks.length}
        inProgressTasks={inProgressTasks.length}
      /> */}

      <div className="grid gap-4 sm:gap-6">
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-red-800 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Aandacht Nodig ({overdueTasks.length})
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedOverdueTasks.length === overdueTasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-red-800"
                  >
                    Selecteer alles
                  </label>
                </div>
                {selectedOverdueTasks.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-white w-full sm:w-auto">
                          <Calendar className="h-4 w-4 mr-2" />
                          {selectedDate ? format(selectedDate, 'PPP', { locale: nl }) : 'Kies datum'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Button 
                            className="w-full" 
                            onClick={handleBulkReschedule}
                            disabled={!selectedDate}
                          >
                            Herplan {selectedOverdueTasks.length} taken
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAiReschedule}
                      disabled={isAiRescheduling}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isAiRescheduling ? 'Bezig...' : 'Herplannen met AI'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-start sm:items-center gap-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={selectedOverdueTasks.includes(task.id)}
                    onCheckedChange={() => handleTaskSelect(task.id)}
                    className="mt-1 sm:mt-0"
                  />
                  <div className="flex-1">
                    <TaskCard
                      task={task}
                      projects={projects}
                      onComplete={onTaskComplete}
                      onTaskStatusChange={onTaskStatusChange}
                      onReschedule={onReschedule}
                      onTaskClick={onTaskClick}
                      showReschedule
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* {inProgressTasks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
              In Behandeling ({inProgressTasks.length})
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onComplete={onTaskComplete}
                  onTaskStatusChange={onTaskStatusChange}
                  onReschedule={onReschedule}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </div>
        )}

        {pendingTasks.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full mr-3"></span>
              Komende Taken ({pendingTasks.length})
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {pendingTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onComplete={onTaskComplete}
                  onTaskStatusChange={onTaskStatusChange}
                  onReschedule={onReschedule}
                  onTaskClick={onTaskClick}
                />
              ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};
