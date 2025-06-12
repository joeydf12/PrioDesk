
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { ProjectOverview } from '@/components/ProjectOverview';
import { Task, Project } from './Index';

const Projects = () => {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Project voorstel afronden',
      description: 'Het Q4 project voorstel finaliseren met budgetschattingen',
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

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    console.log('New task created:', newTask);
    setIsTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-8">
        <ProjectOverview projects={projects} tasks={tasks} />
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

export default Projects;
