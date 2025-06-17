import { supabase } from '@/lib/supabase';
import { TaskAttachment } from '@/types/task';

export const taskAttachmentService = {
  // Create a new attachment with analysis
  async createAttachment(
    taskId: string,
    type: 'file' | 'image' | 'text',
    content: string,
    analysis: string
  ): Promise<TaskAttachment> {
    const { data, error } = await supabase
      .from('task_attachments')
      .insert([
        {
          task_id: taskId,
          type,
          content,
          analysis,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating attachment:', error);
      throw new Error('Failed to create attachment');
    }

    return data;
  },

  // Get all attachments for a task
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
      throw new Error('Failed to fetch attachments');
    }

    return data || [];
  },

  // Update an attachment's analysis
  async updateAnalysis(
    attachmentId: string,
    analysis: string
  ): Promise<TaskAttachment> {
    const { data, error } = await supabase
      .from('task_attachments')
      .update({ analysis, updated_at: new Date().toISOString() })
      .eq('id', attachmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating analysis:', error);
      throw new Error('Failed to update analysis');
    }

    return data;
  },

  // Delete an attachment
  async deleteAttachment(attachmentId: string): Promise<void> {
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId);

    if (error) {
      console.error('Error deleting attachment:', error);
      throw new Error('Failed to delete attachment');
    }
  },
}; 