import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Culture, Task, TaskType } from '../types';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notifications';

interface Props {
  navigation: any;
  route: {
    params: {
      culture: Culture;
      taskType?: TaskType;
    };
  };
}

export const AddTaskScreen: React.FC<Props> = ({ navigation, route }) => {
  const { culture, taskType } = route.params;
  
  const [type, setType] = useState<TaskType>(taskType || 'media_change');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [reminderHours, setReminderHours] = useState('2');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const taskTypes: { value: TaskType; label: string; icon: string }[] = [
    { value: 'media_change', label: 'Media Change', icon: 'water-outline' },
    { value: 'passaging', label: 'Passaging', icon: 'git-branch-outline' },
    { value: 'observation', label: 'Observation', icon: 'eye-outline' },
  ];

  const getDefaultTitle = (taskType: TaskType) => {
    switch (taskType) {
      case 'media_change':
        return `Media change for ${culture.name}`;
      case 'passaging':
        return `Passage ${culture.name}`;
      case 'observation':
        return `Observe ${culture.name}`;
      default:
        return '';
    }
  };

  React.useEffect(() => {
    if (!title) {
      setTitle(getDefaultTitle(type));
    }
  }, [type, culture.name]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const reminderHoursNum = parseInt(reminderHours);
    if (isNaN(reminderHoursNum) || reminderHoursNum < 0) {
      Alert.alert('Error', 'Please enter a valid reminder time');
      return;
    }

    if (scheduledDate <= new Date()) {
      Alert.alert('Error', 'Please select a future date and time');
      return;
    }

    setSaving(true);

    try {
      const newTask: Task = {
        id: Date.now().toString(),
        cultureId: culture.id,
        type,
        title: title.trim(),
        description: description.trim(),
        scheduledDate,
        isCompleted: false,
        isOverdue: false,
        reminderHours: reminderHoursNum,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await StorageService.addTask(newTask);
      
      // Schedule notifications
      await NotificationService.scheduleTaskReminder(newTask);
      await NotificationService.scheduleOverdueAlert(newTask);

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(scheduledDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduledDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledDate(newDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Task</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cultureInfo}>
          <Text style={styles.cultureLabel}>For Culture:</Text>
          <Text style={styles.cultureName}>{culture.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Task Type</Text>
          <View style={styles.typeContainer}>
            {taskTypes.map((taskType) => (
              <TouchableOpacity
                key={taskType.value}
                style={[
                  styles.typeOption,
                  type === taskType.value && styles.typeOptionSelected,
                ]}
                onPress={() => setType(taskType.value)}
              >
                <Ionicons
                  name={taskType.icon as any}
                  size={20}
                  color={type === taskType.value ? '#2196F3' : '#666'}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === taskType.value && styles.typeTextSelected,
                  ]}
                >
                  {taskType.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Additional details about this task..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Scheduled Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={[styles.dateTimeButton, { flex: 1, marginRight: 8 }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {scheduledDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateTimeButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeText}>
                {scheduledDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <Ionicons name="time-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Reminder (hours before)</Text>
          <TextInput
            style={styles.input}
            value={reminderHours}
            onChangeText={setReminderHours}
            placeholder="2"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={scheduledDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cultureInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  cultureLabel: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  cultureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  descriptionInput: {
    minHeight: 80,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  typeOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#f3f9ff',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
    textAlign: 'center',
  },
  typeTextSelected: {
    color: '#2196F3',
  },
  dateTimeContainer: {
    flexDirection: 'row',
  },
  dateTimeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
});
