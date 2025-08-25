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
import { Culture, CultureStatus } from '../types';
import { ApiService } from '../services/api';

interface Props {
  navigation: any;
  route: {
    params: {
      culture: Culture;
    };
  };
}

export const EditCultureScreen: React.FC<Props> = ({ navigation, route }) => {
  const { culture } = route.params;
  
  const [name, setName] = useState(culture.name);
  const [cellType, setCellType] = useState(culture.cellType);
  const [startDate, setStartDate] = useState(new Date(culture.startDate));
  const [passageNumber, setPassageNumber] = useState(culture.passageNumber.toString());
  const [status, setStatus] = useState<CultureStatus>(culture.status);
  const [notes, setNotes] = useState(culture.notes);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a culture name');
      return;
    }

    if (!cellType.trim()) {
      Alert.alert('Error', 'Please enter a cell type');
      return;
    }

    const passageNum = parseInt(passageNumber);
    if (isNaN(passageNum) || passageNum < 0) {
      Alert.alert('Error', 'Please enter a valid passage number');
      return;
    }

    setSaving(true);

    try {
      const updatedCulture: Culture = {
        ...culture,
        name: name.trim(),
        cellType: cellType.trim(),
        startDate,
        passageNumber: passageNum,
        status,
        notes: notes.trim(),
        updatedAt: new Date(),
      };

      await ApiService.updateCulture(updatedCulture);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update culture');
    } finally {
      setSaving(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const statusOptions: { value: CultureStatus; label: string; color: string }[] = [
    { value: 'active', label: 'Active', color: '#4CAF50' },
    { value: 'paused', label: 'Paused', color: '#FF9800' },
    { value: 'terminated', label: 'Terminated', color: '#F44336' },
  ];

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
        <Text style={styles.title}>Edit Culture</Text>
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
        <View style={styles.section}>
          <Text style={styles.label}>Culture Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., HeLa Culture #1"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cell Type *</Text>
          <TextInput
            style={styles.input}
            value={cellType}
            onChangeText={setCellType}
            placeholder="e.g., HeLa, HEK293, CHO"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Passage Number</Text>
          <TextInput
            style={styles.input}
            value={passageNumber}
            onChangeText={setPassageNumber}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusContainer}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusOption,
                  status === option.value && styles.statusOptionSelected,
                  { borderColor: option.color },
                ]}
                onPress={() => setStatus(option.value)}
              >
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: option.color },
                    status === option.value && styles.statusIndicatorSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    status === option.value && { color: option.color },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes about this culture..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
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
  notesInput: {
    minHeight: 100,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  statusOptionSelected: {
    backgroundColor: '#f8f9fa',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusIndicatorSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});
