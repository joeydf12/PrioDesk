import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskStats } from './TaskStats';
import { Task, Project } from '@/types';
import { Button } from './ui/button';
import { Calendar, Sparkles, CheckSquare, AlertCircle } from 'lucide-react';
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
  dailyTaskCapacity?: number; // Maximum number of tasks that can be done per day
  onUpload?: (taskId: string, type: 'file' | 'image' | 'text', content: string, analysis: string) => void;
  onEdit?: (taskId: string, updatedTask: Partial<Task>) => void;
  onAssignmentChange?: () => void;
  canAssign?: boolean; // Whether the current user can assign tasks
}

// Priority scoring system
const PRIORITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3
} as const;

export const TaskDashboard: React.FC<TaskDashboardProps> = ({
  tasks,
  projects,
  onTaskComplete,
  onTaskStatusChange,
  onReschedule,
  onTaskClick,
  dailyTaskCapacity = 7, // Default capacity of 7 tasks per day
  onUpload,
  onEdit,
  onAssignmentChange,
  canAssign
}) => {
  const [selectedOverdueTasks, setSelectedOverdueTasks] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAiRescheduling, setIsAiRescheduling] = useState(false);
  const { toast } = useToast();

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const overdueTasks = tasks;

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
      // Simuleer AI suggestie
      await new Promise(resolve => setTimeout(resolve, 1000));

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Sorteer de geselecteerde taken op prioriteit (hoog naar laag)
      const selectedTasks = selectedOverdueTasks
        .map(taskId => tasks.find(t => t.id === taskId))
        .filter((task): task is Task => task !== undefined)
        .sort((a, b) =>
          (PRIORITY_SCORES[b.priority as keyof typeof PRIORITY_SCORES] || 1) -
          (PRIORITY_SCORES[a.priority as keyof typeof PRIORITY_SCORES] || 1)
        );
      console.log('AI Reschedule - selectedTasks:', selectedTasks);

      for (const task of selectedTasks) {
        const taskScore = PRIORITY_SCORES[task.priority as keyof typeof PRIORITY_SCORES] || 1;
        let currentDate = new Date(tomorrow);
        let foundDate = false;
        const dueDate = new Date(task.due_date);
        console.log(`Rescheduling task '${task.title}' (id: ${task.id}) - dueDate:`, dueDate);

        // Zoek tot en met de deadline
        while (currentDate <= dueDate && !foundDate) {
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
            console.log(`Planned date for task '${task.title}' (id: ${task.id}) set to:`, currentDate.toISOString());
            onReschedule(task.id, currentDate.toISOString());
            foundDate = true;
          } else {
            // Ga naar de volgende dag
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        if (!foundDate) {
          console.log(`No available slot before deadline for task '${task.title}' (id: ${task.id})`);
        }
      }

      toast({
        title: "Taken herpland",
        description: "AI heeft de taken verdeeld over beschikbare dagen vóór de deadline, rekening houdend met prioriteiten en dagelijkse capaciteit.",
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
    <div className="flex flex-col gap-4 w-full h-full">
      {/* { Stats } */}
      {/* <TaskStats 
        totalTasks={tasks.length}
        completedTasks={tasks.filter(t => t.status === 'completed').length}
        overdueTasks={overdueTasks.length}
        inProgressTasks={inProgressTasks.length}
      /> */}

      <div className="w-full h-full">
        {overdueTasks.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-3 sm:p-6 shadow-sm overflow-y-auto h-full">
            <div className="flex flex-col y-overflow-hidden gap-4 mb-4 sm:mb-6 sticky top-0 bg-red-50/80 backdrop-blur-sm z-10 pb-3 sm:pb-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-red-800">
                    Aandacht Nodig
                  </h3>
                  <p className="text-xs sm:text-sm text-red-600">
                    {overdueTasks.length} {overdueTasks.length === 1 ? 'taak' : 'taken'} {overdueTasks.length === 1 ? 'is' : 'zijn'} te laat
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-3 py-2 border border-red-200 w-fit">
                  <Checkbox
                    id="select-all"
                    checked={selectedOverdueTasks.length === overdueTasks.length}
                    onCheckedChange={handleSelectAll}
                    className="border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium text-red-800"
                  >
                    Selecteer alles
                  </label>
                </div>

                {selectedOverdueTasks.length > 0 && (
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row sm:flex-row gap-2 w-full">
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-800 w-full justify-center"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Herplannen
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                          <div className="p-3 border-t">
                            <Button
                              style={{ backgroundColor: '#263354' }}
                              className="w-full shadow-sm"
                              onClick={handleBulkReschedule}
                              disabled={!selectedDate}
                            >
                              Herplan {selectedOverdueTasks.length} taken
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        style={{ backgroundColor: '#263354' }}
                        variant="default"
                        size="sm"
                        onClick={handleAiReschedule}
                        disabled={isAiRescheduling}
                        className="w-full sm:w-auto shadow-sm justify-center"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {isAiRescheduling ? 'Bezig...' : 'Herplannen met AI'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 group">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={selectedOverdueTasks.includes(task.id)}
                    onCheckedChange={() => handleTaskSelect(task.id)}
                    className="mt-1 flex-shrink-0 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <div className="flex-1 min-w-0">
                    <TaskCard
                      task={task}
                      projects={projects}
                      onComplete={onTaskComplete}
                      onTaskStatusChange={onTaskStatusChange}
                      onReschedule={onReschedule}
                      onTaskClick={onTaskClick}
                      showReschedule
                      dailyTaskCapacity={dailyTaskCapacity}
                      onUpload={onUpload}
                      onEdit={onEdit}
                      onAssignmentChange={onAssignmentChange}
                      canAssign={canAssign}
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
