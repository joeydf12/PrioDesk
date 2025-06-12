
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taken niet laden: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => [...prev, data]);
      toast({
        title: "Taak aangemaakt",
        description: "De taak is succesvol toegevoegd.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taak niet aanmaken: " + error.message,
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taak niet bijwerken: " + error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Taak verwijderd",
        description: "De taak is succesvol verwijderd.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taak niet verwijderen: " + error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};
