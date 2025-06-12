
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Task, Project } from './Index';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Project voorstel afronden',
      description: 'Het Q4 project voorstel finaliseren met budgetschattingen',
      dueDate: '2025-06-15',
      priority: 'high',
      effort: 'large',
      project: 'Q4 Planning',
      status: 'in-progress',
      createdAt: '2025-06-10',
      notes: 'Coördinatie met financieel team nodig'
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
    }
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'completed' as const, completedAt: new Date().toISOString() } : task
    ));
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setTasks(prev => [...prev, task]);
    setIsTaskModalOpen(false);
  };

  const activeTasks = tasks.filter(task => task.status !== 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mijn Taken</h1>
          <p className="text-slate-600">Beheer al je actieve taken op één plek</p>
        </div>

        <div className="grid gap-4">
          {activeTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              projects={projects}
              onComplete={handleTaskComplete}
              onStatusChange={handleTaskStatusChange}
            />
          ))}
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

export default Tasks;
