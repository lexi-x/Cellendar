import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Culture, Task } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  navigation: any;
  route: {
    params: {
      culture: Culture;
    };
  };
}

export const CultureDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const [culture, setCulture] = useState<Culture>(route.params.culture);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = async () => {
    try {
      const [cultures, allTasks] = await Promise.all([
        StorageService.getCultures(),
        StorageService.getTasks(),
      ]);
      
      const updatedCulture = cultures.find(c => c.id === culture.id);
      if (updatedCulture) {
        setCulture(updatedCulture);
      }
      
      const cultureTasks = allTasks.filter(t => t.cultureId === culture.id);
      setTasks(cultureTasks);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [culture.id])
  );

  const getStatusColor = (status: Culture['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'paused':
        return '#FF9800';
      case 'terminated':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString();
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

  const getTaskTypeLabel = (type: Task['type']) => {
    switch (type) {
      case 'media_change':
        return 'Media Change';
      case 'passaging':
        return 'Passaging';
      case 'observation':
        return 'Observation';
      default:
        return type;
    }
  };

  const upcomingTasks = tasks
    .filter(t => !t.isCompleted && new Date(t.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  const recentTasks = tasks
    .filter(t => t.isCompleted)
    .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
    .slice(0, 3);

  const overdueTasks = tasks.filter(t => t.isOverdue);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Culture Details</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditCulture', { culture })}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Culture Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cultureName}>{culture.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(culture.status) }]}>
              <Text style={styles.statusText}>{culture.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cell Type</Text>
              <Text style={styles.infoValue}>{culture.cellType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Passage</Text>
              <Text style={styles.infoValue}>{culture.passageNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Started</Text>
              <Text style={styles.infoValue}>{formatDate(culture.startDate)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Last Action</Text>
              <Text style={styles.infoValue}>{formatDate(culture.lastActionDate)}</Text>
            </View>
          </View>

          {culture.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{culture.notes}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTask', { 
                culture, 
                taskType: 'media_change' 
              })}
            >
              <Ionicons name="water-outline" size={24} color="#2196F3" />
              <Text style={styles.actionText}>Media Change</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTask', { 
                culture, 
                taskType: 'passaging' 
              })}
            >
              <Ionicons name="git-branch-outline" size={24} color="#2196F3" />
              <Text style={styles.actionText}>Passaging</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddTask', { 
                culture, 
                taskType: 'observation' 
              })}
            >
              <Ionicons name="eye-outline" size={24} color="#2196F3" />
              <Text style={styles.actionText}>Observation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <View style={[styles.card, styles.overdueCard]}>
            <Text style={[styles.cardTitle, styles.overdueTitle]}>
              Overdue Tasks ({overdueTasks.length})
            </Text>
            {overdueTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Ionicons
                  name={getTaskTypeIcon(task.type)}
                  size={20}
                  color="#F44336"
                />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.overdueText}>
                    Due: {formatDateTime(task.scheduledDate)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upcoming Tasks</Text>
            {upcomingTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Ionicons
                  name={getTaskTypeIcon(task.type)}
                  size={20}
                  color="#666"
                />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>
                    {formatDateTime(task.scheduledDate)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Tasks</Text>
            {recentTasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#4CAF50"
                />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>
                    Completed: {formatDateTime(task.completedDate!)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  editButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cultureName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  overdueTitle: {
    color: '#F44336',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 8,
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
  overdueText: {
    fontSize: 12,
    color: '#F44336',
  },
});
