import { Culture, Task, NotificationSettings } from '../types';
import { supabase } from '../config/supabase';

export class ApiService {
  // Culture operations
  static async getCultures(): Promise<Culture[]> {
    try {
      const { data, error } = await supabase
        .from('cultures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((culture: any) => ({
        id: culture.id,
        name: culture.name,
        cellType: culture.cell_type,
        startDate: new Date(culture.start_date),
        passageNumber: culture.passage_number,
        status: culture.status,
        notes: culture.notes,
        lastActionDate: new Date(culture.last_action_date),
        repeatableNotifications: [],
        createdAt: new Date(culture.created_at),
        updatedAt: new Date(culture.updated_at),
      }));
    } catch (error) {
      console.error('Error loading cultures:', error);
      throw error;
    }
  }

  static async addCulture(culture: Omit<Culture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Culture> {
    try {
      const { data, error } = await supabase
        .from('cultures')
        .insert({
          name: culture.name,
          cell_type: culture.cellType,
          start_date: culture.startDate.toISOString(),
          passage_number: culture.passageNumber,
          status: culture.status,
          notes: culture.notes,
          last_action_date: culture.lastActionDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        cellType: data.cell_type,
        startDate: new Date(data.start_date),
        passageNumber: data.passage_number,
        status: data.status,
        notes: data.notes,
        lastActionDate: new Date(data.last_action_date),
        repeatableNotifications: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error adding culture:', error);
      throw error;
    }
  }

  static async updateCulture(culture: Culture): Promise<void> {
    try {
      const { error } = await supabase
        .from('cultures')
        .update({
          name: culture.name,
          cell_type: culture.cellType,
          start_date: culture.startDate.toISOString(),
          passage_number: culture.passageNumber,
          status: culture.status,
          notes: culture.notes,
          last_action_date: culture.lastActionDate.toISOString(),
        })
        .eq('id', culture.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating culture:', error);
      throw error;
    }
  }

  static async deleteCulture(cultureId: string): Promise<void> {
    try {
      // Delete associated tasks first
      await supabase
        .from('tasks')
        .delete()
        .eq('culture_id', cultureId);

      // Then delete the culture
      const { error } = await supabase
        .from('cultures')
        .delete()
        .eq('id', cultureId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting culture:', error);
      throw error;
    }
  }

  // Task operations
  static async getTasks(): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((task: any) => ({
        id: task.id,
        cultureId: task.culture_id,
        type: task.type,
        title: task.title,
        description: task.description,
        scheduledDate: new Date(task.scheduled_date),
        isCompleted: task.is_completed,
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        reminderHours: task.reminder_hours || 2,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        isOverdue: new Date() > new Date(task.scheduled_date) && !task.is_completed,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  }

  static async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isOverdue'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          culture_id: task.cultureId,
          type: task.type,
          title: task.title,
          description: task.description,
          scheduled_date: task.scheduledDate.toISOString(),
          is_completed: task.isCompleted,
          completed_date: task.completedDate?.toISOString(),
          reminder_hours: task.reminderHours,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        cultureId: data.culture_id,
        type: data.type,
        title: data.title,
        description: data.description,
        scheduledDate: new Date(data.scheduled_date),
        isCompleted: data.is_completed,
        completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
        reminderHours: data.reminder_hours || 2,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isOverdue: new Date() > new Date(data.scheduled_date) && !data.is_completed,
      };
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  static async updateTask(task: Task): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          culture_id: task.cultureId,
          type: task.type,
          title: task.title,
          description: task.description,
          scheduled_date: task.scheduledDate.toISOString(),
          is_completed: task.isCompleted,
          completed_date: task.completedDate?.toISOString(),
          reminder_hours: task.reminderHours,
        })
        .eq('id', task.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  static async completeTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: true,
          completed_date: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  }

  // Notification settings
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Return default settings if none exist
        return {
          enabled: true,
          defaultReminderHours: 2,
          overdueAlerts: true,
        };
      }

      return {
        enabled: data.enabled,
        defaultReminderHours: data.default_reminder_hours,
        overdueAlerts: data.overdue_alerts,
      };
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return {
        enabled: true,
        defaultReminderHours: 2,
        overdueAlerts: true,
      };
    }
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          enabled: settings.enabled,
          default_reminder_hours: settings.defaultReminderHours,
          overdue_alerts: settings.overdueAlerts,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }
}
