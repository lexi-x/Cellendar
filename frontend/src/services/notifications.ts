import * as Notifications from 'expo-notifications';
import { Task, NotificationSettings } from '../types';
import { ApiService } from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }

  static async scheduleTaskReminder(task: Task): Promise<string | null> {
    try {
      const settings = await ApiService.getNotificationSettings();
      if (!settings.enabled) return null;

      const reminderTime = new Date(task.scheduledDate);
      reminderTime.setHours(reminderTime.getHours() - task.reminderHours);

      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Cell Culture Task Reminder',
          body: `${task.title} is due in ${task.reminderHours} hours`,
          data: { taskId: task.id, type: 'reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async scheduleOverdueAlert(task: Task): Promise<string | null> {
    try {
      const settings = await ApiService.getNotificationSettings();
      if (!settings.enabled || !settings.overdueAlerts) return null;

      // Schedule overdue alert 1 hour after due time
      const overdueTime = new Date(task.scheduledDate);
      overdueTime.setHours(overdueTime.getHours() + 1);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Overdue Task Alert',
          body: `${task.title} is overdue!`,
          data: { taskId: task.id, type: 'overdue' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: overdueTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling overdue alert:', error);
      return null;
    }
  }

  static async cancelTaskNotifications(taskId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.taskId === taskId
      );

      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  static async rescheduleAllTaskNotifications(): Promise<void> {
    try {
      // Cancel all existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get all incomplete tasks and reschedule
      const tasks = await ApiService.getTasks();
      const incompleteTasks = tasks.filter(task => !task.isCompleted);

      for (const task of incompleteTasks) {
        await this.scheduleTaskReminder(task);
        await this.scheduleOverdueAlert(task);
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  }

  static async getDailyTaskSummary(): Promise<void> {
    try {
      const tasks = await ApiService.getTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaysTasks = tasks.filter(task => {
        const taskDate = new Date(task.scheduledDate);
        return taskDate >= today && taskDate < tomorrow && !task.isCompleted;
      });

      if (todaysTasks.length > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Daily Task Summary',
            body: `You have ${todaysTasks.length} task(s) scheduled for today`,
            data: { type: 'daily_summary' },
          },
          // trigger: {
          //   hour: 8,
          //   minute: 0,
          //   repeats: true,
          // },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: today,
          }
        });
      }
    } catch (error) {
      console.error('Error scheduling daily summary:', error);
    }
  }
}
