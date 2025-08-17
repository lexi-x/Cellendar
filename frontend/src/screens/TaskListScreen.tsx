import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Task, Culture } from '../types';
import { StorageService } from '../services/storage';
import { NotificationService } from '../services/notifications';

interface Props {
  navigation: any;
}

export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [loadedTasks, loadedCultures] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getCultures(),
      ]);
      setTasks(loadedTasks);
      setCultures(loadedCultures);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleCompleteTask = async (task: Task) => {
    try {
      await StorageService.completeTask(task.id);
      await NotificationService.cancelTaskNotifications(task.id);
      
      // If it's a passaging task, increment the culture's passage number
      if (task.type === 'passaging') {
        const culture = cultures.find(c => c.id === task.cultureId);
        if (culture) {
          const updatedCulture = {
            ...culture,
            passageNumber: culture.passageNumber + 1,
            lastActionDate: new Date(),
            updatedAt: new Date(),
          };
          await StorageService.updateCulture(updatedCulture);
        }
      }
      
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteTask(task.id);
              await NotificationService.cancelTaskNotifications(task.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return tasks.filter(t => !t.isCompleted && !t.isOverdue);
      case 'overdue':
        return tasks.filter(t => t.isOverdue);
      case 'completed':
        return tasks.filter(t => t.isCompleted);
      default:
        return tasks;
    }
  };

  const getCultureName = (cultureId: string) => {
    const culture = cultures.find(c => c.id === cultureId);
    return culture?.name || 'Unknown Culture';
  };

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'media_change':
        return 'water-outline';
      case 'passaging':
        return 'git-branch-outline';
      case 'observation':
        return 'eye-outline';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={[
      styles.taskItem,
      item.isOverdue && styles.overdueTask,
      item.isCompleted && styles.completedTask,
    ]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => {
          // Navigate to task detail or culture detail
          const culture = cultures.find(c => c.id === item.cultureId);
          if (culture) {
            navigation.navigate('CultureDetail', { culture });
          }
        }}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Ionicons
              name={getTaskTypeIcon(item.type)}
              size={20}
              color={item.isOverdue ? '#F44336' : item.isCompleted ? '#4CAF50' : '#666'}
            />
            <View style={styles.taskDetails}>
              <Text style={[
                styles.taskTitle,
                item.isCompleted && styles.completedText,
              ]}>
                {item.title}
              </Text>
              <Text style={styles.cultureName}>
                {getCultureName(item.cultureId)}
              </Text>
            </View>
          </View>
          <View style={styles.taskActions}>
            {!item.isCompleted && (
              <TouchableOpacity
                onPress={() => handleCompleteTask(item)}
                style={styles.actionButton}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => handleDeleteTask(item)}
              style={styles.actionButton}
            >
              <Ionicons name="trash-outline" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.taskMeta}>
          <Text style={[
            styles.taskDate,
            item.isOverdue && styles.overdueText,
          ]}>
            {item.isCompleted 
              ? `Completed: ${formatDateTime(item.completedDate!)}`
              : `Due: ${formatDateTime(item.scheduledDate)}`
            }
          </Text>
          {item.isOverdue && (
            <Text style={styles.overdueLabel}>OVERDUE</Text>
          )}
        </View>

        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const filterOptions = [
    { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.isCompleted && !t.isOverdue).length },
    { key: 'overdue', label: 'Overdue', count: tasks.filter(t => t.isOverdue).length },
    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.isCompleted).length },
    { key: 'all', label: 'All', count: tasks.length },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
      </View>

      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              filter === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(option.key as any)}
          >
            <Text style={[
              styles.filterText,
              filter === option.key && styles.filterTextActive,
            ]}>
              {option.label} ({option.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {filter === 'pending' ? 'No pending tasks' :
             filter === 'overdue' ? 'No overdue tasks' :
             filter === 'completed' ? 'No completed tasks' :
             'No tasks yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === 'pending' || filter === 'all' 
              ? 'Add tasks from your culture details'
              : ''
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  overdueTask: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  completedTask: {
    opacity: 0.7,
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  cultureName: {
    fontSize: 12,
    color: '#666',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    color: '#F44336',
  },
  overdueLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F44336',
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
