
import React, { useState } from 'react';
import { TaskDashboard } from '@/components/TaskDashboard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { Header } from '@/components/Header';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { AIInsights } from '@/components/AIInsights';
import { ProjectOverview } from '@/components/ProjectOverview';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'small' | 'medium' | 'large';
  project: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  tasks: Task[];
  createdAt: string;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Finalize the Q4 project proposal with budget estimates',
      dueDate: '2025-06-15',
      priority: 'high',
      effort: 'large',
      project: 'Q4 Planning',
      status: 'in-progress',
      createdAt: '2025-06-10',
      notes: 'Need to coordinate with finance team'
    },
    {
      id: '2',
      title: 'Review team presentations',
      description: 'Review and provide feedback on the team presentations',
      dueDate: '2025-06-13',
      priority: 'medium',
      effort: 'medium',
      project: 'Team Development',
      status: 'pending',
      createdAt: '2025-06-11'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Q4 Planning',
      description: 'Strategic planning for the fourth quarter',
      color: 'bg-blue-100 text-blue-800',
      tasks: [],
      createdAt: '2025-06-01'
    },
    {
      id: '2',
      name: 'Team Development',
      description: 'Focus on team growth and skill development',
      color: 'bg-green-100 text-green-800',
      tasks: [],
      createdAt: '2025-06-05'
    }
  ]);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'projects'>('dashboard');

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const completedTask = { ...task, status: 'completed' as const, completedAt: new Date().toISOString() };
        setCelebrationTask(completedTask);
        return completedTask;
      }
      return task;
    }));
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

  const handleTaskReschedule = (taskId: string, newDate: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, dueDate: newDate, status: 'pending' } : task
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header 
        onCreateTask={() => setIsTaskModalOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <AIInsights tasks={tasks} />
        
        {activeView === 'dashboard' ? (
          <TaskDashboard 
            tasks={tasks}
            projects={projects}
            onTaskComplete={handleTaskComplete}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskReschedule={handleTaskReschedule}
          />
        ) : (
          <ProjectOverview 
            projects={projects}
            tasks={tasks}
          />
        )}
      </main>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleTaskCreate}
        projects={projects}
      />

      <CompletionCelebration
        task={celebrationTask}
        onClose={() => setCelebrationTask(null)}
      />
    </div>
  );
};

export default Index;
