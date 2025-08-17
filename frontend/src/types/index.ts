export interface RepeatableNotification {
  id: string;
  title: string;
  message: string;
  startDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: Date;
}

export interface Culture {
  id: string;
  name: string;
  cellType: string;
  startDate: Date;
  passageNumber: number;
  lastActionDate: Date;
  notes: string;
  status: 'active' | 'paused' | 'terminated';
  repeatableNotifications: RepeatableNotification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  cultureId: string;
  type: 'media_change' | 'passaging' | 'observation';
  title: string;
  description?: string;
  scheduledDate: Date;
  completedDate?: Date;
  isCompleted: boolean;
  isOverdue: boolean;
  reminderHours: number; // Hours before due time to remind
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  enabled: boolean;
  defaultReminderHours: number;
  overdueAlerts: boolean;
}

export interface AppData {
  cultures: Culture[];
  tasks: Task[];
  notificationSettings: NotificationSettings;
}

export type TaskType = 'media_change' | 'passaging' | 'observation';
export type CultureStatus = 'active' | 'paused' | 'terminated';

export interface CreateCultureData {
  name: string;
  cellType: string;
  startDate: Date;
  notes?: string;
}

export interface CreateTaskData {
  cultureId: string;
  type: TaskType;
  title: string;
  description?: string;
  scheduledDate: Date;
  reminderHours?: number;
}
