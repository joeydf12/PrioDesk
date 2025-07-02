import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ListTodo, X, Edit, Trash2, Share2, Copy, Check, Users, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

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
  color?: string;
  created_at: string;
  updated_at: string;
  tasks: number;
  tasksList: Task[];
}

interface SharedMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  permission: string;
  shared_at: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sharedMembers, setSharedMembers] = useState<SharedMember[]>([]);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isShareProjectOpen, setIsShareProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only fetch projects when user is authenticated and auth loading is complete
    if (!authLoading && user) {
      fetchProjects();
    } else if (!authLoading && !user) {
      // If auth loading is complete but no user, redirect to login
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch shared members when a project is selected
  useEffect(() => {
    if (selectedProject && user) {
      const currentProject = projects.find(p => p.id === selectedProject);
      // Only fetch shared members if the current user is the project owner
      if (currentProject && currentProject.user_id === user.id) {
        fetchSharedMembers(selectedProject);
      } else {
        setSharedMembers([]);
      }
    } else {
      setSharedMembers([]);
    }
  }, [selectedProject, user, projects]);

  const fetchProjects = async () => {
    if (!user) {
      setError('Gebruiker niet ingelogd');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

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
    if (!user) {
      setError('Gebruiker niet ingelogd');
      return;
    }

    if (!newProjectName.trim()) {
      setError('Project naam is verplicht');
      return;
    }

    try {
      const { error: createError } = await supabase
        .from('projects')
        .insert([
          {
            name: newProjectName.trim(),
            description: newProjectDescription.trim(),
            user_id: user.id
          }
        ]);

      if (createError) throw createError;

      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreateProjectOpen(false);
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Er is een fout opgetreden bij het aanmaken van het project');
    }
  };

  const handleEditProject = async () => {
    if (!user || !editingProject) {
      setError('Gebruiker niet ingelogd of project niet gevonden');
      return;
    }

    if (!editProjectName.trim()) {
      setError('Project naam is verplicht');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          name: editProjectName.trim(),
          description: editProjectDescription.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setEditProjectName('');
      setEditProjectDescription('');
      setEditingProject(null);
      setIsEditProjectOpen(false);
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Er is een fout opgetreden bij het bijwerken van het project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) {
      setError('Gebruiker niet ingelogd');
      return;
    }

    try {
      // First delete all tasks associated with the project
      const { error: tasksDeleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (tasksDeleteError) throw tasksDeleteError;

      // Then delete the project
      const { error: projectDeleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectDeleteError) throw projectDeleteError;

      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Er is een fout opgetreden bij het verwijderen van het project');
    }
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setIsEditProjectOpen(true);
  };

  const openShareModal = (project: Project) => {
    // Security check: only the project owner can share the project
    if (!user || project.user_id !== user.id) {
      toast({
        title: 'Geen toegang',
        description: 'Alleen de project eigenaar kan het project delen.',
        variant: 'destructive',
      });
      return;
    }

    setSharingProject(project);
    setShareEmail('');
    setSharePermission('view');
    setIsShareProjectOpen(true);
  };

  const handleShareProject = async () => {
    if (!user || !sharingProject) {
      setError('Gebruiker niet ingelogd of project niet gevonden');
      return;
    }

    if (!shareEmail.trim()) {
      setError('E-mailadres is verplicht');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail.trim())) {
      setError('Voer een geldig e-mailadres in');
      return;
    }

    try {
      // Try to find the user in the profiles table
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', shareEmail.trim())
        .single();

      if (userError) {
        // Handle the 406 error specifically
        if (userError.code === '406' || userError.message.includes('406')) {
          toast({
            title: 'Database configuratie probleem',
            description: 'Er is een probleem met de database configuratie. Neem contact op met de beheerder om de RLS policies bij te werken.',
            variant: 'destructive',
          });
          return;
        }
        // Other errors
        toast({
          title: 'Gebruiker niet gevonden',
          description: 'Er is geen gebruiker gevonden met dit e-mailadres. De gebruiker moet eerst een account aanmaken.',
          variant: 'destructive',
        });
        return;
      }

      if (!userData) {
        toast({
          title: 'Gebruiker niet gevonden',
          description: 'Er is geen gebruiker gevonden met dit e-mailadres. De gebruiker moet eerst een account aanmaken.',
          variant: 'destructive',
        });
        return;
      }

      // Insert into project_shares (not projects!)
      const { error: shareError } = await supabase
        .from('project_shares')
        .insert([
          {
            project_id: sharingProject.id,
            shared_by: user.id,
            shared_with: userData.id,
            permission: sharePermission
          }
        ]);

      if (shareError) {
        toast({
          title: 'Fout bij delen',
          description: 'Er is een fout opgetreden bij het delen van het project: ' + shareError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Project gedeeld',
        description: `Project "${sharingProject.name}" is succesvol gedeeld met ${shareEmail}`,
      });

      setShareEmail('');
      setSharePermission('view');
      setIsShareProjectOpen(false);

      // Refresh shared members if the shared project is currently selected
      if (selectedProject === sharingProject.id) {
        await fetchSharedMembers(sharingProject.id);
      }
    } catch (error) {
      console.error('Error sharing project:', error);
      setError('Er is een fout opgetreden bij het delen van het project');
    }
  };

  // Add a function to remove a share (for the owner)
  const removeShare = async (shareId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', shareId)
        .eq('shared_by', user.id);
      if (error) {
        toast({
          title: 'Fout bij verwijderen',
          description: 'Er is een fout opgetreden bij het verwijderen van de share: ' + error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Share verwijderd',
          description: 'De gebruiker is succesvol verwijderd uit het project.',
        });
        // Optionally refresh shared members
        if (selectedProject) await fetchSharedMembers(selectedProject);
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het verwijderen van de share.',
        variant: 'destructive',
      });
    }
  };

  const copyTasksToNewProject = async (originalProjectId: string, newProjectId: string, targetUserId: string) => {
    try {
      // Get all tasks from the original project
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', originalProjectId);

      if (tasksError) throw tasksError;

      if (tasks && tasks.length > 0) {
        // Copy tasks to the new project
        const tasksToInsert = tasks.map(task => ({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          effort: task.effort,
          notes: task.notes,
          project_id: newProjectId,
          user_id: targetUserId
        }));

        const { error: copyTasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert);

        if (copyTasksError) throw copyTasksError;
      }
    } catch (error) {
      console.error('Error copying tasks:', error);
      throw error;
    }
  };

  const copyShareLink = async () => {
    if (!sharingProject) return;

    const shareLink = `${window.location.origin}/projects/${sharingProject.id}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: 'Link gekopieerd',
        description: 'De projectlink is gekopieerd naar je klembord.',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: 'Fout bij kopiëren',
        description: 'Kon de link niet kopiëren naar klembord.',
        variant: 'destructive',
      });
    }
  };

  const fetchSharedMembers = async (projectId: string) => {
    if (!user) return;

    // Security check: only the project owner can fetch shared members
    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject || currentProject.user_id !== user.id) {
      setSharedMembers([]);
      return;
    }

    try {
      // Fetch all shares for this project
      const { data: shares, error: sharesError } = await supabase
        .from('project_shares')
        .select('id, shared_with, permission, created_at')
        .eq('project_id', projectId);

      if (sharesError) {
        console.error('Error fetching project shares:', sharesError);
        setSharedMembers([]);
        return;
      }

      if (shares && shares.length > 0) {
        // Get user details for each shared_with
        const memberPromises = shares.map(async (share) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .eq('id', share.shared_with)
            .single();

          if (userError || !userData) {
            return null;
          }

          return {
            id: share.id,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            permission: share.permission,
            shared_at: share.created_at
          };
        });

        const members = (await Promise.all(memberPromises)).filter(Boolean) as SharedMember[];
        setSharedMembers(members);
      } else {
        setSharedMembers([]);
      }
    } catch (error) {
      console.error('Error fetching shared members:', error);
      setSharedMembers([]);
    }
  };

  const removeSharedMember = async (memberId: string) => {
    if (!user || !selectedProject) return;

    // Security check: only the project owner can remove shared members
    const currentProject = projects.find(p => p.id === selectedProject);
    if (!currentProject || currentProject.user_id !== user.id) {
      toast({
        title: 'Geen toegang',
        description: 'Alleen de project eigenaar kan leden verwijderen.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Find the share for this member
      const share = sharedMembers.find(m => m.id === memberId);
      if (!share) {
        toast({
          title: 'Fout',
          description: 'Kon de share niet vinden.',
          variant: 'destructive',
        });
        return;
      }

      // Delete the share from project_shares
      const { error: deleteError } = await supabase
        .from('project_shares')
        .delete()
        .eq('id', share.id)
        .eq('shared_by', user.id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        toast({
          title: 'Fout',
          description: `Er is een fout opgetreden bij het verwijderen van de gedeelde gebruiker: ${deleteError.message}`,
          variant: 'destructive',
        });
        return;
      }

      // Refresh shared members
      await fetchSharedMembers(selectedProject);

      toast({
        title: 'Gebruiker verwijderd',
        description: 'De gebruiker is succesvol verwijderd uit het project.',
      });
    } catch (error) {
      console.error('Error removing shared member:', error);
      toast({
        title: 'Fout',
        description: 'Er is een fout opgetreden bij het verwijderen van de gebruiker.',
        variant: 'destructive',
      });
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
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
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchProjects}>Opnieuw proberen</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

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
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Projecten laden...</p>
                </div>
              ) : selectedProject ? (
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {projects.find(p => p.id === selectedProject)?.name}
                        </h2>
                        <p className="text-slate-600">
                          {projects.find(p => p.id === selectedProject)?.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(projects.find(p => p.id === selectedProject)!)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Bewerken
                        </Button>
                        {user && projects.find(p => p.id === selectedProject)?.user_id === user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openShareModal(projects.find(p => p.id === selectedProject)!)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Delen
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijderen
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Project verwijderen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Weet je zeker dat je dit project wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt en alle taken in dit project zullen ook worden verwijderd.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuleren</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProject(selectedProject)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Verwijderen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ListTodo className="w-5 h-5" />
                        Taken
                      </h3>
                      <div className="space-y-2">
                        {projects.find(p => p.id === selectedProject)?.tasksList.length === 0 ? (
                          <p className="text-slate-500 text-center py-4">Geen taken in dit project</p>
                        ) : (
                          projects.find(p => p.id === selectedProject)?.tasksList.map(task => (
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
                          ))
                        )}
                      </div>
                    </div>

                    {/* Shared Members Section */}
                    {user && projects.find(p => p.id === selectedProject)?.user_id === user.id && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Gedeelde leden
                        </h3>
                        <div className="space-y-2">
                          {sharedMembers.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">Dit project is nog niet gedeeld</p>
                          ) : (
                            sharedMembers.map(member => (
                              <Card key={member.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="font-medium">
                                        {member.first_name && member.last_name 
                                          ? `${member.first_name} ${member.last_name}`
                                          : member.email
                                        }
                                      </p>
                                      <p className="text-sm text-slate-500">{member.email}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {member.permission === 'edit' ? 'Bewerken' : 'Bekijken'}
                                    </Badge>
                                  </div>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <UserX className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Lid verwijderen</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Weet je zeker dat je {member.first_name && member.last_name 
                                            ? `${member.first_name} ${member.last_name}`
                                            : member.email
                                          } wilt verwijderen uit dit project? Deze actie kan niet ongedaan worden gemaakt.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => removeSharedMember(member.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Verwijderen
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-slate-500 mb-4">Je hebt nog geen projecten</p>
                      <p className="text-slate-400 text-sm">Maak je eerste project aan om te beginnen</p>
                    </div>
                  ) : (
                    projects.map(project => (
                      <Card
                        key={project.id}
                        className="p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(project);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {user && project.user_id === user.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openShareModal(project);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Project verwijderen</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Weet je zeker dat je "{project.name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt en alle taken in dit project zullen ook worden verwijderd.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Verwijderen
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">{project.description}</p>
                        <div 
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => setSelectedProject(project.id)}
                        >
                          <Badge variant="secondary">Actief</Badge>
                          <span className="text-sm text-slate-500">{project.tasks} taken</span>
                        </div>
                      </Card>
                    ))
                  )}
                  <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
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
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="projectName">Project naam</Label>
                          <Input 
                            id="projectName" 
                            placeholder="Voer project naam in" 
                            value={newProjectName} 
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateProject();
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="projectDescription">Beschrijving</Label>
                          <Input 
                            id="projectDescription" 
                            placeholder="Voer project beschrijving in" 
                            value={newProjectDescription} 
                            onChange={(e) => setNewProjectDescription(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleCreateProject();
                              }
                            }}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleCreateProject}
                          disabled={!newProjectName.trim()}
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

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Project Bewerken</DialogTitle>
            <DialogDescription>
              Bewerk de details van je project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editProjectName">Project naam</Label>
              <Input 
                id="editProjectName" 
                placeholder="Voer project naam in" 
                value={editProjectName} 
                onChange={(e) => setEditProjectName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditProject();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editProjectDescription">Beschrijving</Label>
              <Input 
                id="editProjectDescription" 
                placeholder="Voer project beschrijving in" 
                value={editProjectDescription} 
                onChange={(e) => setEditProjectDescription(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditProject();
                  }
                }}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleEditProject}
              disabled={!editProjectName.trim()}
            >
              Project bijwerken
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Project Dialog */}
      <Dialog open={isShareProjectOpen} onOpenChange={setIsShareProjectOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Project Delen</DialogTitle>
            <DialogDescription>
              Deel je project met andere gebruikers door hun e-mailadres in te voeren.
              <br />
              <span className="text-sm text-amber-600 mt-2 block">
                ⚠️ De ontvanger moet een account hebben in dit systeem.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shareEmail">E-mailadres</Label>
              <Input 
                id="shareEmail" 
                type="email"
                placeholder="gebruiker@voorbeeld.nl" 
                value={shareEmail} 
                onChange={(e) => setShareEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleShareProject();
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sharePermission">Toestemming</Label>
              <select
                id="sharePermission"
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value as 'view' | 'edit')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="view">Alleen bekijken</option>
                <option value="edit">Bekijken en bewerken</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Directe link</Label>
              <div className="flex gap-2">
                <Input 
                  value={sharingProject ? `${window.location.origin}/projects/${sharingProject.id}` : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={copyShareLink}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Kopieer deze link om het project direct te delen
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleShareProject}
              disabled={!shareEmail.trim()}
            >
              Project delen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNav />
    </div>
  );
};

export default Projects;
