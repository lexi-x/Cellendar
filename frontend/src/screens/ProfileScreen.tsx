import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Divider,
  Avatar,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut, loading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setSigningOut(false);
            }
          },
        },
      ]
    );
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={80}
              label={getInitials(user.email)}
              style={styles.avatar}
            />
            <Title style={styles.email}>{user.email}</Title>
            <Paragraph style={styles.memberSince}>
              Member since {formatDate(user.created_at)}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account Settings</Title>
            
            <List.Item
              title="Email"
              description={user.email}
              left={(props) => <List.Icon {...props} icon="email" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="User ID"
              description={user.id}
              left={(props) => <List.Icon {...props} icon="identifier" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Account Created"
              description={formatDate(user.created_at)}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>App Information</Title>
            
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Data Storage"
              description="Supabase Cloud"
              left={(props) => <List.Icon {...props} icon="cloud" />}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="View our privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: Navigate to privacy policy
                Alert.alert('Info', 'Privacy policy coming soon');
              }}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>

        {/* Sign Out Button */}
        <Card style={styles.signOutCard}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleSignOut}
              loading={signingOut}
              disabled={signingOut}
              buttonColor="#d32f2f"
              textColor="white"
              style={styles.signOutButton}
              icon="logout"
            >
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  email: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberSince: {
    color: '#666',
    fontSize: 14,
  },
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  signOutCard: {
    marginBottom: 32,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
  },
  signOutButton: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;
