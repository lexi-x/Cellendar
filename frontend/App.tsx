import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationService } from './src/services/notifications';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  useEffect(() => {
    // Initialize notifications
    NotificationService.requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
