import React, { useState } from 'react';
import { TaskDashboard } from '@/components/TaskDashboard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { Header } from '@/components/Header';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { AIInsights } from '@/components/AIInsights';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Calendar, Sparkles } from 'lucide-react';

const Index = () => {
  const { tasks, loading: tasksLoading, createTask, updateTask, refetch } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loading = tasksLoading || projectsLoading;

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      setCelebrationTask({ ...task, status: 'completed', completed_at: new Date().toISOString() });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await createTask(newTask);
    setIsTaskModalOpen(false);
  };

  const handleTaskReschedule = async (taskId: string, newDate: string) => {
    await updateTask(taskId, { due_date: newDate, status: 'pending' });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpload = async (type: 'file' | 'image' | 'text', content: string, analysis: string) => {
    // Refresh the tasks data to show the new attachment
    await refetch();
  };

  // Get today's tasks
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks.filter(task => task.due_date === today && task.status !== 'completed');

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

      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Tip of the day */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
            Tip van de dag
          </h4>
          <p className="text-sm text-blue-700">
            Begin je dag met de belangrijkste taak. Door eerst de moeilijkste taak aan te pakken,
            bouw je momentum op voor de rest van de dag.
          </p>
        </div>
        
        {/* Today's Date and Tasks Section */}
        <div className="flex flex-col gap-6 w-full sm:flex-row sm:items-start">
          <div className={`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 w-full mb-4 sm:mb-0`}>
            <div className="flex items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                Vandaag - {new Date().toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-600 mb-2">Geen taken voor vandaag</h3>
                <p className="text-sm sm:text-base text-slate-500">Je hebt alle taken afgerond of er staan geen taken gepland!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 overflow-y-auto max-h-[300px]">
                {todaysTasks.map(task => (
                  <div key={task.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-800 text-sm sm:text-base mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-blue-700 text-xs sm:text-sm mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 text-xs sm:text-sm font-medium">
                        Prioriteit: {task.priority} • Inspanning: {task.effort}
                      </span>
                      <button
                        onClick={() => handleTaskClick(task)}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                      >
                        Bekijk details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full sm:w-[400px]">
            <TaskDashboard
              tasks={tasks}
              projects={projects}
              onTaskComplete={handleTaskComplete}
              onTaskStatusChange={handleTaskStatusChange}
              onReschedule={handleTaskReschedule}
              onTaskClick={handleTaskClick}
              onUpload={handleTaskUpload}
            />
          </div>
        </div>

        <div className="w-full">
          <AIInsights tasks={tasks} />
        </div>
      </main>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleTaskCreate}
        projects={projects}
      />

      <TaskDetailModal
        task={selectedTask}
        projects={projects}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <CompletionCelebration
        task={celebrationTask}
        onClose={() => setCelebrationTask(null)}
      />
    </div>
  );
};

export default Index;
