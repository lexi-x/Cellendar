import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Culture, Task } from '../types';
import { ApiService } from '../services/api';

interface Props {
  navigation: any;
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [loadedCultures, loadedTasks] = await Promise.all([
        ApiService.getCultures(),
        ApiService.getTasks(),
      ]);
      setCultures(loadedCultures);
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysTasks = tasks.filter(task => {
    const taskDate = new Date(task.scheduledDate);
    return taskDate >= today && taskDate < tomorrow && !task.isCompleted;
  });

  const overdueTasks = tasks.filter(t => t.isOverdue);
  const activeCultures = cultures.filter(c => c.status === 'active');
  const upcomingTasks = tasks
    .filter(t => !t.isCompleted && new Date(t.scheduledDate) >= tomorrow)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  const handleCompleteTask = async (task: Task) => {
    try {
      await ApiService.completeTask(task.id);
      
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
          await ApiService.updateCulture(updatedCulture);
        }
      }
      
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeCultures.length}</Text>
          <Text style={styles.statLabel}>Active Cultures</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#2196F3' }]}>
            {todaysTasks.length}
          </Text>
          <Text style={styles.statLabel}>Today's Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#F44336' }]}>
            {overdueTasks.length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddCulture')}
          >
            <Ionicons name="flask-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>New Culture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CultureList')}
          >
            <Ionicons name="list-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>View Cultures</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('TaskList')}
          >
            <Ionicons name="checkmark-done-outline" size={24} color="#2196F3" />
            <Text style={styles.actionText}>All Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.alertHeader}>
            <Ionicons name="warning" size={24} color="#F44336" />
            <Text style={styles.alertTitle}>
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
            </Text>
          </View>
          {overdueTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Ionicons
                  name={getTaskTypeIcon(task.type)}
                  size={16}
                  color="#F44336"
                />
                <View style={styles.taskDetails}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCulture}>
                    {getCultureName(task.cultureId)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleCompleteTask(task)}
                style={styles.completeButton}
              >
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ))}
          {overdueTasks.length > 3 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate('TaskList')}
            >
              <Text style={styles.viewMoreText}>
                View {overdueTasks.length - 3} more overdue tasks
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Today's Tasks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Tasks ({todaysTasks.length})</Text>
        {todaysTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={32} color="#4CAF50" />
            <Text style={styles.emptyText}>No tasks scheduled for today!</Text>
          </View>
        ) : (
          todaysTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Ionicons
                  name={getTaskTypeIcon(task.type)}
                  size={16}
                  color="#666"
                />
                <View style={styles.taskDetails}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCulture}>
                    {getCultureName(task.cultureId)} • {formatTime(task.scheduledDate)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleCompleteTask(task)}
                style={styles.completeButton}
              >
                <Ionicons name="checkmark" size={16} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upcoming Tasks</Text>
          {upcomingTasks.map((task) => (
            <View key={task.id} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Ionicons
                  name={getTaskTypeIcon(task.type)}
                  size={16}
                  color="#666"
                />
                <View style={styles.taskDetails}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCulture}>
                    {getCultureName(task.cultureId)} • {formatDate(task.scheduledDate)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Cultures */}
      {activeCultures.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Cultures ({activeCultures.length})</Text>
          {activeCultures.slice(0, 5).map((culture) => (
            <TouchableOpacity
              key={culture.id}
              style={styles.cultureItem}
              onPress={() => navigation.navigate('CultureDetail', { culture })}
            >
              <View style={styles.cultureInfo}>
                <Ionicons name="flask" size={16} color="#4CAF50" />
                <View style={styles.cultureDetails}>
                  <Text style={styles.cultureName}>{culture.name}</Text>
                  <Text style={styles.cultureType}>
                    {culture.cellType} • Passage {culture.passageNumber}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
          {activeCultures.length > 5 && (
            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate('CultureList')}
            >
              <Text style={styles.viewMoreText}>
                View {activeCultures.length - 5} more cultures
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDetails: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  taskCulture: {
    fontSize: 12,
    color: '#666',
  },
  completeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#e8f5e8',
  },
  cultureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cultureInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cultureDetails: {
    flex: 1,
    marginLeft: 8,
  },
  cultureName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  cultureType: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  viewMoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
});
