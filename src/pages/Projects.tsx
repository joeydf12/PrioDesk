import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ListTodo, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string;
  effort: string;
  notes: string | null;
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tasks: number;
  tasksList: Task[];
}

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);

      if (projectsError) throw projectsError;

      const projectsWithTasks = await Promise.all(
        projectsData.map(async (project) => {
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', project.id);

          if (tasksError) throw tasksError;

          return {
            ...project,
            tasks: tasksData.length,
            tasksList: tasksData,
          };
        })
      );

      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Er is een fout opgetreden bij het ophalen van de projecten');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Gebruiker niet ingelogd');
        return;
      }

      const { error: createError } = await supabase
        .from('projects')
        .insert([
          {
            name: newProjectName,
            description: newProjectDescription,
            user_id: user.id
          }
        ]);

      if (createError) throw createError;

      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateProjectOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Er is een fout opgetreden bij het aanmaken van het project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => { }} />

      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar profiel
            </Button>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Projecten</h1>
            <p className="text-slate-600">Beheer je projecten en taken</p>
          </div>

          <Card>
            <CardContent className="p-6">
              {selectedProject ? (
                <div>
                  <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => setSelectedProject(null)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Terug naar projecten
                  </Button>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                      {projects.find(p => p.id === selectedProject)?.name}
                    </h2>
                    <p className="text-slate-600">
                      {projects.find(p => p.id === selectedProject)?.description}
                    </p>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListTodo className="w-5 h-5" />
                        Taken
                      </h3>
                      <div className="space-y-2">
                        {projects.find(p => p.id === selectedProject)?.tasksList.map(task => (
                          <Card key={task.id} className="p-3">
                            <div className="flex items-center justify-between">
                              <span>{task.title}</span>
                              <Badge variant={
                                task.status === 'completed' ? 'default' :
                                  task.status === 'in-progress' ? 'secondary' :
                                    'outline'
                              }>
                                {task.status === 'completed' ? 'Voltooid' :
                                  task.status === 'in-progress' ? 'In uitvoering' :
                                    'Te doen'}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <Card
                      key={project.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                      <p className="text-sm text-slate-600 mb-4">{project.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Actief</Badge>
                        <span className="text-sm text-slate-500">{project.tasks} taken</span>
                      </div>
                    </Card>
                  ))}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="p-4 border-2 border-dashed hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center">
                        <div className="text-center">
                          <Plus className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-slate-600">Nieuw project</p>
                        </div>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Nieuw Project</DialogTitle>
                        <DialogDescription>
                          Maak een nieuw project aan om je taken te organiseren.
                        </DialogDescription>
                        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Close</span>
                        </DialogClose>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="projectName">Project naam</Label>
                          <Input id="projectName" placeholder="Voer project naam in" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="projectDescription">Beschrijving</Label>
                          <Input id="projectDescription" placeholder="Voer project beschrijving in" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleCreateProject}
                        >
                          Project aanmaken
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Projects;
