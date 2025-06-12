
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Task, Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

const Tasks = () => {
  const { tasks, createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskComplete = async (taskId: string) => {
    await updateTask(taskId, { 
      status: 'completed', 
      completed_at: new Date().toISOString() 
    });
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await createTask(newTask);
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
              onTaskStatusChange={handleTaskStatusChange}
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
