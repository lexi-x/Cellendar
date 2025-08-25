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
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import { DashboardScreen } from '../screens/DashboardScreen';
import { CultureListScreen } from '../screens/CultureListScreen';
import { AddCultureScreen } from '../screens/AddCultureScreen';
import { EditCultureScreen } from '../screens/EditCultureScreen';
import { CultureDetailScreen } from '../screens/CultureDetailScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { List } from 'react-native-paper';

// Define the parameter lists

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddTask: { cultureId: string };
};

type MainTabsParamList = {
  Dashboard: undefined;
  Cultures: undefined;
  Tasks: undefined;
  Profile: undefined;
};

type CultureStackParamList = {
  CultureList: undefined;
  AddCulture: undefined;
  EditCulture: { culture: Culture };
  CultureDetail: { cultureId: string };
  AddTask: { cultureId: string };
};

type TaskStackParamList = {
  TaskList: undefined;
}

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

type TaskListScreenProps = {
  navigation: StackNavigationProp<TaskStackParamList, 'TaskList'>;
  route: RouteProp<TaskStackParamList, 'TaskList'>;
};


const Tab = createBottomTabNavigator<MainTabsParamList>();
const Stack = createStackNavigator<CultureStackParamList>();
const TaskStack = createStackNavigator<TaskStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
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

      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen as React.ComponentType}
        options={{ title: 'Get Task List' }}
      />
    </Stack.Navigator>
  );
};

// Task List Navigator
const TaskStackNavigator = () => {
  return (
    <TaskStack.Navigator screenOptions={{ headerShown: false }}>
      <TaskStack.Screen 
        name="TaskList" 
        component={TaskListScreen as React.ComponentType}
        options={{ title: 'Access Task LIst' }}
      />
      </TaskStack.Navigator>
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
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
      <Tab.Screen name="Tasks" component={TaskStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// Root Stack Navigator with Auth Check
export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="Main" component={TabNavigator} />
          <RootStack.Screen 
            name="AddTask" 
            component={AddTaskScreen as React.ComponentType}
            options={({ route }) => ({ 
              title: 'Add Task',
              headerShown: true 
            })}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};
