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
import { Culture } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  navigation: any;
}

export const CultureListScreen: React.FC<Props> = ({ navigation }) => {
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCultures = async () => {
    try {
      const loadedCultures = await StorageService.getCultures();
      setCultures(loadedCultures);
    } catch (error) {
      console.error('Error loading cultures:', error);
      Alert.alert('Error', 'Failed to load cultures');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCultures();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadCultures();
    }, [])
  );

  const handleDeleteCulture = (culture: Culture) => {
    Alert.alert(
      'Delete Culture',
      `Are you sure you want to delete "${culture.name}"? This will also delete all associated tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteCulture(culture.id);
              await loadCultures();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete culture');
            }
          },
        },
      ]
    );
  };

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

  const renderCultureItem = ({ item }: { item: Culture }) => (
    <TouchableOpacity
      style={styles.cultureItem}
      onPress={() => navigation.navigate('CultureDetail', { culture: item })}
    >
      <View style={styles.cultureHeader}>
        <View style={styles.cultureInfo}>
          <Text style={styles.cultureName}>{item.name}</Text>
          <Text style={styles.cellType}>{item.cellType}</Text>
        </View>
        <View style={styles.cultureActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCulture', { culture: item })}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteCulture(item)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cultureDetails}>
        <Text style={styles.detailText}>Passage: {item.passageNumber}</Text>
        <Text style={styles.detailText}>Started: {formatDate(item.startDate)}</Text>
        <Text style={styles.detailText}>Last Action: {formatDate(item.lastActionDate)}</Text>
      </View>
      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading cultures...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cell Cultures</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCulture')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {cultures.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="flask-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No cultures yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first culture</Text>
        </View>
      ) : (
        <FlatList
          data={cultures}
          keyExtractor={(item) => item.id}
          renderItem={renderCultureItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  cultureItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cultureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cultureInfo: {
    flex: 1,
  },
  cultureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cellType: {
    fontSize: 14,
    color: '#666',
  },
  cultureActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  cultureDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  notes: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 4,
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
