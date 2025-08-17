import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentPickerResult } from 'expo-document-picker';
import { StorageService } from '../services/storage';
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
      const settings = await StorageService.getNotificationSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await StorageService.exportData();
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `cellendar_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      await Share.share({
        url: fileUri,
        title: 'Export Cellendar Data',
      });

      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
        const data = JSON.parse(content);

        Alert.alert(
          'Import Data',
          'This will replace all existing data. Are you sure?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              style: 'destructive',
              onPress: async () => {
                try {
                  await StorageService.importData(data);
                  await NotificationService.rescheduleAllTaskNotifications();
                  Alert.alert('Success', 'Data imported successfully!');
                } catch (error) {
                  Alert.alert('Error', 'Failed to import data. Please check the file format.');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error importing data:', error);
      Alert.alert('Error', 'Failed to import data');
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all cultures, tasks, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const toggleNotifications = async () => {
    const newSettings = {
      ...notificationSettings,
      enabled: !notificationSettings.enabled,
    };
    
    try {
      await StorageService.saveNotificationSettings(newSettings);
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
      await StorageService.saveNotificationSettings(newSettings);
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

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={styles.settingInfo}>
            <Ionicons name="download-outline" size={24} color="#2196F3" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Backup all cultures and tasks to a file
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleImportData}>
          <View style={styles.settingInfo}>
            <Ionicons name="cloud-upload-outline" size={24} color="#2196F3" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Import Data</Text>
              <Text style={styles.settingDescription}>
                Restore from a backup file
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearAllData}>
          <View style={styles.settingInfo}>
            <Ionicons name="trash-outline" size={24} color="#F44336" />
            <View style={styles.settingText}>
              <Text style={[styles.settingLabel, { color: '#F44336' }]}>Clear All Data</Text>
              <Text style={styles.settingDescription}>
                Permanently delete all data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
