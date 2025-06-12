
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Task, Project } from './Index';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Planning = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Project voorstel afronden',
      description: 'Het Q4 project voorstel finaliseren',
      dueDate: '2025-06-15',
      priority: 'high',
      effort: 'large',
      project: 'Q4 Planning',
      status: 'in-progress',
      createdAt: '2025-06-10'
    },
    {
      id: '2',
      title: 'Team presentaties beoordelen',
      description: 'Team presentaties beoordelen en feedback geven',
      dueDate: '2025-06-13',
      priority: 'medium',
      effort: 'medium',
      project: 'Team Ontwikkeling',
      status: 'pending',
      createdAt: '2025-06-11'
    },
    {
      id: '5',
      title: 'Klant vergadering',
      description: 'Maandelijkse check-in met belangrijkste klant',
      dueDate: '2025-06-16',
      priority: 'high',
      effort: 'small',
      project: 'Client Management',
      status: 'pending',
      createdAt: '2025-06-11'
    },
    {
      id: '6',
      title: 'Code review',
      description: 'Pull requests bekijken en feedback geven',
      dueDate: '2025-06-14',
      priority: 'medium',
      effort: 'medium',
      project: 'Development',
      status: 'pending',
      createdAt: '2025-06-11'
    }
  ]);

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'Q4 Planning',
      description: 'Strategische planning voor het vierde kwartaal',
      color: 'bg-blue-100 text-blue-800',
      tasks: [],
      createdAt: '2025-06-01'
    },
    {
      id: '2',
      name: 'Team Ontwikkeling',
      description: 'Focus op teamgroei en vaardigheidsontwikkeling',
      color: 'bg-green-100 text-green-800',
      tasks: [],
      createdAt: '2025-06-05'
    },
    {
      id: '4',
      name: 'Client Management',
      description: 'Client relatie management',
      color: 'bg-orange-100 text-orange-800',
      tasks: [],
      createdAt: '2025-06-03'
    },
    {
      id: '5',
      name: 'Development',
      description: 'Software ontwikkeling taken',
      color: 'bg-purple-100 text-purple-800',
      tasks: [],
      createdAt: '2025-06-01'
    }
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    console.log('New task created:', newTask);
    setIsTaskModalOpen(false);
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
    return tasks.filter(task => task.dueDate === dateString && task.status !== 'completed');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            Weekplanning
          </h1>
          <p className="text-slate-600">Bekijk je taken per dag van de week</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={previousWeek}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Vorige week
          </Button>
          
          <h2 className="text-xl font-semibold text-slate-700">
            Week van {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
          </h2>
          
          <Button variant="outline" onClick={nextWeek}>
            Volgende week
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className={`bg-white rounded-lg border p-4 ${isToday ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}>
                <div className="mb-3">
                  <h3 className={`font-semibold ${isToday ? 'text-blue-800' : 'text-slate-800'}`}>
                    {dayNames[index]}
                  </h3>
                  <p className={`text-sm ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                    {day.getDate()}/{day.getMonth() + 1}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">Geen taken</p>
                  ) : (
                    dayTasks.map(task => {
                      const project = projects.find(p => p.name === task.project);
                      return (
                        <div key={task.id} className="bg-slate-50 rounded p-2 text-sm">
                          <h4 className="font-medium text-slate-800 mb-1">{task.title}</h4>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge variant="outline" className={getPriorityColor(task.priority)} size="sm">
                              {task.priority}
                            </Badge>
                            {project && (
                              <Badge variant="outline" className={project.color} size="sm">
                                {project.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
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
    </div>
  );
};

export default Planning;
