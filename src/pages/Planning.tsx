
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { DayPlanningModal } from '@/components/DayPlanningModal';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Planning = () => {
  const { tasks, loading: tasksLoading, createTask, updateTask } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const loading = tasksLoading || projectsLoading;

  const handleTaskCreate = async (newTask: any) => {
    await createTask(newTask);
    setIsTaskModalOpen(false);
  };

  const handleTaskComplete = async (taskId: string) => {
    await updateTask(taskId, { 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    });
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: any) => {
    await updateTask(taskId, { status: newStatus });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.due_date === dateString && task.status !== 'completed');
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-600" />
            Weekplanning
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">Bekijk je taken per dag van de week</p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <Button variant="outline" onClick={previousWeek} className="text-xs sm:text-sm">
            <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Vorige week</span>
            <span className="sm:hidden">Vorige</span>
          </Button>
          
          <h2 className="text-sm sm:text-xl font-semibold text-slate-700 text-center">
            <span className="hidden sm:inline">Week van </span>
            {weekDays[0].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
          </h2>
          
          <Button variant="outline" onClick={nextWeek} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Volgende week</span>
            <span className="sm:hidden">Volgende</span>
            <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`bg-white rounded-lg border p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow ${isToday ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="mb-3">
                  <h3 className={`font-semibold text-sm sm:text-base ${isToday ? 'text-blue-800' : 'text-slate-800'}`}>
                    {dayNames[index]}
                  </h3>
                  <p className={`text-xs sm:text-sm ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="text-slate-400 text-xs sm:text-sm italic">Geen taken</p>
                  ) : (
                    dayTasks.slice(0, 3).map(task => {
                      const project = projects.find(p => p.id === task.project_id);
                      return (
                        <div key={task.id} className="bg-slate-50 rounded p-2 text-xs sm:text-sm">
                          <h4 className="font-medium text-slate-800 mb-1 truncate">{task.title}</h4>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {project && (
                              <Badge variant="outline" className={project.color}>
                                {project.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {dayTasks.length > 3 && (
                    <p className="text-slate-500 text-xs text-center">
                      +{dayTasks.length - 3} meer
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleTaskCreate}
        projects={projects}
      />

      <DayPlanningModal
        date={selectedDate}
        tasks={tasks}
        projects={projects}
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        onTaskComplete={handleTaskComplete}
        onTaskStatusChange={handleTaskStatusChange}
      />
    </div>
  );
};

export default Planning;
