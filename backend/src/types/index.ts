export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface Culture {
  id: string;
  user_id: string;
  name: string;
  cell_type: string;
  start_date: Date;
  passage_number: number;
  last_action_date: Date;
  notes: string;
  status: 'active' | 'paused' | 'terminated';
  created_at: Date;
  updated_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  culture_id: string;
  type: 'media_change' | 'passaging' | 'observation';
  title: string;
  description?: string;
  scheduled_date: Date;
  completed_date?: Date;
  is_completed: boolean;
  reminder_hours: number;
  created_at: Date;
  updated_at: Date;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  enabled: boolean;
  default_reminder_hours: number;
  overdue_alerts: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCultureRequest {
  name: string;
  cell_type: string;
  start_date: string;
  notes?: string;
}

export interface UpdateCultureRequest {
  name?: string;
  cell_type?: string;
  passage_number?: number;
  notes?: string;
  status?: 'active' | 'paused' | 'terminated';
}

export interface CreateTaskRequest {
  culture_id: string;
  type: 'media_change' | 'passaging' | 'observation';
  title: string;
  description?: string;
  scheduled_date: string;
  reminder_hours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  scheduled_date?: string;
  reminder_hours?: number;
  is_completed?: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
