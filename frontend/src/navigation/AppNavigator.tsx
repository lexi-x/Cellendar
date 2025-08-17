import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  createStackNavigator, 
  StackNavigationProp,
  StackScreenProps 
} from '@react-navigation/stack';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Culture } from '../types';

// Import screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { CultureListScreen } from '../screens/CultureListScreen';
import { AddCultureScreen } from '../screens/AddCultureScreen';
import { EditCultureScreen } from '../screens/EditCultureScreen';
import { CultureDetailScreen } from '../screens/CultureDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Define the parameter lists

type RootStackParamList = {
  Main: undefined;
  AddTask: { cultureId: string };
};

type MainTabsParamList = {
  Dashboard: undefined;
  Cultures: undefined;
  Tasks: undefined;
  Settings: undefined;
};

type CultureStackParamList = {
  CultureList: undefined;
  AddCulture: undefined;
  EditCulture: { culture: Culture };
  CultureDetail: { cultureId: string };
  AddTask: { cultureId: string };
};

// Navigation prop types
type CultureStackNavigationProp<T extends keyof CultureStackParamList> = {
  navigation: StackNavigationProp<CultureStackParamList, T>;
  route: RouteProp<CultureStackParamList, T>;
};

// Screen props types
type CultureListScreenProps = {
  navigation: StackNavigationProp<CultureStackParamList, 'CultureList'>;
};

type AddCultureScreenProps = {
  navigation: StackNavigationProp<CultureStackParamList, 'AddCulture'>;
};

type EditCultureScreenProps = {
  navigation: StackNavigationProp<CultureStackParamList, 'EditCulture'>;
  route: RouteProp<CultureStackParamList, 'EditCulture'>;
};

type CultureDetailScreenProps = {
  navigation: StackNavigationProp<CultureStackParamList, 'CultureDetail'>;
  route: RouteProp<CultureStackParamList, 'CultureDetail'>;
};

type AddTaskScreenProps = {
  navigation: StackNavigationProp<CultureStackParamList, 'AddTask'>;
  route: RouteProp<CultureStackParamList, 'AddTask'>;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();
const Stack = createStackNavigator<CultureStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// Culture Stack Navigator
const CultureStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="CultureList" 
        component={CultureListScreen as React.ComponentType}
        options={{ title: 'My Cultures' }}
      />
      <Stack.Screen 
        name="AddCulture" 
        component={AddCultureScreen as React.ComponentType}
        options={{ title: 'Add New Culture' }}
      />
      <Stack.Screen 
        name="EditCulture" 
        component={EditCultureScreen as React.ComponentType}
        options={({ route }) => ({ 
          title: `Edit ${route.params?.culture?.name || 'Culture'}`,
          headerShown: true 
        })}
      />
      <Stack.Screen 
        name="CultureDetail" 
        component={CultureDetailScreen as React.ComponentType}
        options={{ title: 'Culture Details' }}
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen as React.ComponentType}
        options={{ title: 'Add New Task' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Cultures') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Cultures" component={CultureStackNavigator} />
      <Tab.Screen name="Tasks" component={TaskListScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const AppNavigator = () => {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={TabNavigator} />
      <RootStack.Screen 
        name="AddTask" 
        component={AddTaskScreen as React.ComponentType}
        options={({ route }) => ({ 
          title: 'Add Task',
          headerShown: true 
        })}
      />
    </RootStack.Navigator>
  );
};
