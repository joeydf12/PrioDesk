import { supabase } from '@/lib/supabase';
import { TaskAssignment } from '@/types';

export const taskAssignmentService = {
  // Assign a task to a user
  async assignTask(taskId: string, assignedTo: string, notes?: string): Promise<TaskAssignment | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, update the task with the assigned_to field
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({ assigned_to: assignedTo })
        .eq('id', taskId);

      if (taskUpdateError) throw taskUpdateError;

      // Then, create a task assignment record
      const { data, error } = await supabase
        .from('task_assignments')
        .insert([
          {
            task_id: taskId,
            assigned_by: user.id,
            assigned_to: assignedTo,
            notes: notes
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  },

  // Get all assignments for a task
  async getTaskAssignments(taskId: string): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('task_id', taskId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task assignments:', error);
      throw error;
    }
  },

  // Get current assignment for a task
  async getCurrentAssignment(taskId: string): Promise<TaskAssignment | null> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('task_id', taskId)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return data;
    } catch (error) {
      console.error('Error fetching current assignment:', error);
      return null;
    }
  },

  // Unassign a task
  async unassignTask(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update the task to remove assignment
      const { error: taskUpdateError } = await supabase
        .from('tasks')
        .update({ assigned_to: null })
        .eq('id', taskId);

      if (taskUpdateError) throw taskUpdateError;

      // Create an assignment record with null assigned_to to track unassignment
      const { error: assignmentError } = await supabase
        .from('task_assignments')
        .insert([
          {
            task_id: taskId,
            assigned_by: user.id,
            assigned_to: user.id, // Use assigner as placeholder since we can't have null
            notes: 'Task unassigned'
          }
        ]);

      if (assignmentError) throw assignmentError;
    } catch (error) {
      console.error('Error unassigning task:', error);
      throw error;
    }
  },

  // Get all assignments made by a user
  async getAssignmentsByUser(userId: string): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('assigned_by', userId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assignments by user:', error);
      throw error;
    }
  },

  // Get all assignments for a user
  async getAssignmentsToUser(userId: string): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*')
        .eq('assigned_to', userId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assignments to user:', error);
      throw error;
    }
  },

  // Get assignments for a project
  async getProjectAssignments(projectId: string): Promise<TaskAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          tasks!inner(project_id)
        `)
        .eq('tasks.project_id', projectId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      throw error;
    }
  }
}; 