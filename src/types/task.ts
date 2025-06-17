export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  created_at: string;
  updated_at: string;
  analysis?: string;
  attachments?: TaskAttachment[];
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  type: 'file' | 'image' | 'text';
  content: string;
  analysis?: string;
  created_at: string;
  updated_at: string;
} 