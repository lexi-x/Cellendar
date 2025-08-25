import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiService } from '../services/api';
import { NotificationService } from '../services/notifications';

interface Props {
  navigation: any;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    defaultReminderHours: 2,
    overdueAlerts: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await ApiService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };


  const toggleNotifications = async () => {
    const newSettings = {
      ...notificationSettings,
      enabled: !notificationSettings.enabled,
    };
    
    try {
      await ApiService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      
      if (newSettings.enabled) {
        const hasPermission = await NotificationService.requestPermissions();
        if (hasPermission) {
          await NotificationService.rescheduleAllTaskNotifications();
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const toggleOverdueAlerts = async () => {
    const newSettings = {
      ...notificationSettings,
      overdueAlerts: !notificationSettings.overdueAlerts,
    };
    
    try {
      await ApiService.saveNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      await NotificationService.rescheduleAllTaskNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={toggleNotifications}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders for scheduled tasks
              </Text>
            </View>
          </View>
          <View style={[
            styles.toggle,
            notificationSettings.enabled && styles.toggleActive
          ]}>
            <View style={[
              styles.toggleThumb,
              notificationSettings.enabled && styles.toggleThumbActive
            ]} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, !notificationSettings.enabled && styles.settingDisabled]} 
          onPress={toggleOverdueAlerts}
          disabled={!notificationSettings.enabled}
        >
          <View style={styles.settingInfo}>
            <Ionicons name="warning-outline" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Overdue Alerts</Text>
              <Text style={styles.settingDescription}>
                Get notified when tasks are overdue
              </Text>
            </View>
          </View>
          <View style={[
            styles.toggle,
            notificationSettings.overdueAlerts && notificationSettings.enabled && styles.toggleActive
          ]}>
            <View style={[
              styles.toggleThumb,
              notificationSettings.overdueAlerts && notificationSettings.enabled && styles.toggleThumbActive
            ]} />
          </View>
        </TouchableOpacity>
      </View>


      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle-outline" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="flask-outline" size={24} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Cellendar</Text>
              <Text style={styles.settingDescription}>
                Personal cell culture schedule tracking
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingDisabled: {
    opacity: 0.5,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#2196F3',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
