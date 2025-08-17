import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Culture, Task, NotificationSettings } from '../types';

const STORAGE_KEYS = {
  CULTURES: 'cultures',
  TASKS: 'tasks',
  NOTIFICATION_SETTINGS: 'notification_settings',
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  defaultReminderHours: 2,
  overdueAlerts: true,
};

export class StorageService {
  // Culture operations
  static async getCultures(): Promise<Culture[]> {
    try {
      const culturesJson = await AsyncStorage.getItem(STORAGE_KEYS.CULTURES);
      if (!culturesJson) return [];
      
      const cultures = JSON.parse(culturesJson);
      return cultures.map((culture: any) => ({
        ...culture,
        startDate: new Date(culture.startDate),
        lastActionDate: new Date(culture.lastActionDate),
        createdAt: new Date(culture.createdAt),
        updatedAt: new Date(culture.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading cultures:', error);
      return [];
    }
  }

  static async saveCultures(cultures: Culture[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CULTURES, JSON.stringify(cultures));
    } catch (error) {
      console.error('Error saving cultures:', error);
      throw error;
    }
  }

  static async addCulture(culture: Culture): Promise<void> {
    const cultures = await this.getCultures();
    cultures.push(culture);
    await this.saveCultures(cultures);
  }

  static async updateCulture(updatedCulture: Culture): Promise<void> {
    const cultures = await this.getCultures();
    const index = cultures.findIndex(c => c.id === updatedCulture.id);
    if (index !== -1) {
      cultures[index] = updatedCulture;
      await this.saveCultures(cultures);
    }
  }

  static async deleteCulture(cultureId: string): Promise<void> {
    const cultures = await this.getCultures();
    const filteredCultures = cultures.filter(c => c.id !== cultureId);
    await this.saveCultures(filteredCultures);
    
    // Also delete associated tasks
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.cultureId !== cultureId);
    await this.saveTasks(filteredTasks);
  }

  // Task operations
  static async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (!tasksJson) return [];
      
      const tasks = JSON.parse(tasksJson);
      return tasks.map((task: any) => ({
        ...task,
        scheduledDate: new Date(task.scheduledDate),
        completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        isOverdue: new Date() > new Date(task.scheduledDate) && !task.isCompleted,
      }));
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }

  static async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    await this.saveTasks(tasks);
  }

  static async updateTask(updatedTask: Task): Promise<void> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      await this.saveTasks(tasks);
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    await this.saveTasks(filteredTasks);
  }

  static async completeTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = true;
      task.completedDate = new Date();
      task.updatedAt = new Date();
      await this.saveTasks(tasks);
    }
  }

  // Notification settings
  static async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (!settingsJson) return DEFAULT_NOTIFICATION_SETTINGS;
      return JSON.parse(settingsJson);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  static async saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
      throw error;
    }
  }

  // Data export/import
  static async exportData(): Promise<AppData> {
    const [cultures, tasks, notificationSettings] = await Promise.all([
      this.getCultures(),
      this.getTasks(),
      this.getNotificationSettings(),
    ]);

    return {
      cultures,
      tasks,
      notificationSettings,
    };
  }

  static async importData(data: AppData): Promise<void> {
    await Promise.all([
      this.saveCultures(data.cultures),
      this.saveTasks(data.tasks),
      this.saveNotificationSettings(data.notificationSettings),
    ]);
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.CULTURES),
      AsyncStorage.removeItem(STORAGE_KEYS.TASKS),
      AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATION_SETTINGS),
    ]);
  }
}
