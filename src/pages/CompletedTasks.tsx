import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Task, Project } from '@/types';
import { CheckSquare } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

const CompletedTasks = () => {
  const { tasks, createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await createTask(newTask);
    setIsTaskModalOpen(false);
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completed_at: task.status === 'completed' ? null : new Date().toISOString()
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
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
                onComplete={handleTaskComplete}
                onTaskStatusChange={handleTaskStatusChange}
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
