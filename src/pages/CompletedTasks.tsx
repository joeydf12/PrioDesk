
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Task, Project } from './Index';
import { CheckSquare } from 'lucide-react';

const CompletedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '3',
      title: 'Website redesign voltooien',
      description: 'Nieuwe website layout implementeren',
      dueDate: '2025-06-10',
      priority: 'high',
      effort: 'large',
      project: 'Website Project',
      status: 'completed',
      createdAt: '2025-06-05',
      completedAt: '2025-06-10'
    },
    {
      id: '4',
      title: 'Client vergadering voorbereiden',
      description: 'Presentatie en documenten klaarzetten',
      dueDate: '2025-06-08',
      priority: 'medium',
      effort: 'small',
      project: 'Client Management',
      status: 'completed',
      createdAt: '2025-06-07',
      completedAt: '2025-06-08'
    }
  ]);

  const [projects] = useState<Project[]>([
    {
      id: '3',
      name: 'Website Project',
      description: 'Complete website vernieuwing',
      color: 'bg-purple-100 text-purple-800',
      tasks: [],
      createdAt: '2025-06-01'
    },
    {
      id: '4',
      name: 'Client Management',
      description: 'Client relatie management',
      color: 'bg-orange-100 text-orange-800',
      tasks: [],
      createdAt: '2025-06-03'
    }
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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

  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
            <CheckSquare className="w-8 h-8 mr-3 text-green-600" />
            Afgeronde Taken
          </h1>
          <p className="text-slate-600">Bekijk je voltooide taken en prestaties</p>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Nog geen afgeronde taken</h3>
            <p className="text-slate-500">Je afgeronde taken verschijnen hier wanneer je ze voltooit</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onComplete={() => {}}
                onStatusChange={() => {}}
              />
            ))}
          </div>
        )}
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

export default CompletedTasks;
