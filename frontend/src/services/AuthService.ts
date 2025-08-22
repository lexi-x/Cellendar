import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User | null;
    session: AuthSession | null;
  };
  error?: string;
}

class AuthService {
  private static readonly STORAGE_KEYS = {
    SESSION: 'auth_session',
    USER: 'auth_user',
  };

  // Register new user
  static async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.session) {
        await this.storeSession(data.session);
      }

      return {
        success: true,
        data: {
          user: data.user as User,
          session: data.session as AuthSession,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.session) {
        await this.storeSession(data.session);
      }

      return {
        success: true,
        data: {
          user: data.user as User,
          session: data.session as AuthSession,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sign in failed. Please try again.',
      };
    }
  }

  // Sign out user
  static async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      await this.clearSession();

      return {
        success: true,
        data: {
          user: null,
          session: null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sign out failed. Please try again.',
      };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return user as User;
    } catch (error) {
      return null;
    }
  }

  // Get current session
  static async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session as AuthSession;
    } catch (error) {
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session !== null && session.expires_at > Date.now() / 1000;
  }

  // Store session in AsyncStorage
  private static async storeSession(session: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
      if (session.user) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(session.user));
      }
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  // Clear session from AsyncStorage
  private static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.STORAGE_KEYS.SESSION, this.STORAGE_KEYS.USER]);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Get stored session
  static async getStoredSession(): Promise<AuthSession | null> {
    try {
      const sessionJson = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSION);
      if (!sessionJson) return null;
      return JSON.parse(sessionJson);
    } catch (error) {
      console.error('Failed to get stored session:', error);
      return null;
    }
  }

  // Get stored user
  static async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.STORAGE_KEYS.USER);
      if (!userJson) return null;
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to get stored user:', error);
      return null;
    }
  }

  // Set up auth state change listener
  static onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Refresh session
  static async refreshSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.session) {
        await this.storeSession(data.session);
      }

      return {
        success: true,
        data: {
          user: data.user as User,
          session: data.session as AuthSession,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Session refresh failed.',
      };
    }
  }
}

export default AuthService;
