
export interface Task {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'small' | 'medium' | 'large';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}
