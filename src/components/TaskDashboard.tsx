
import React from 'react';
import { TaskCard } from './TaskCard';
import { TaskStats } from './TaskStats';
import { Task, Project } from '@/types';

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
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    const dueDate = new Date(task.due_date);
    return task.status !== 'completed' && dueDate < today;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <TaskStats 
        totalTasks={tasks.length}
        completedTasks={tasks.filter(t => t.status === 'completed').length}
        overdueTasks={overdueTasks.length}
        inProgressTasks={inProgressTasks.length}
      />

      <div className="grid gap-4 sm:gap-6">
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Needs Attention ({overdueTasks.length})
            </h3>
            <div className="grid gap-3 sm:gap-4">
              {overdueTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  onComplete={onTaskComplete}
                  onTaskStatusChange={onTaskStatusChange}
                  onReschedule={onReschedule}
                  onTaskClick={onTaskClick}
                  showReschedule
                />
              ))}
            </div>
          </div>
        )}

        {inProgressTasks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
              In Progress ({inProgressTasks.length})
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
              Upcoming ({pendingTasks.length})
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
        )}
      </div>
    </div>
  );
};
