
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon projecten niet laden: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setProjects(prev => [...prev, data]);
      toast({
        title: "Project aangemaakt",
        description: "Het project is succesvol toegevoegd.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon project niet aanmaken: " + error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    refetch: fetchProjects,
  };
};
