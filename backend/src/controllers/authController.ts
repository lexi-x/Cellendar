import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { ApiResponse, AuthRequest } from '../types';

interface AuthResponse {
  user: any;
  session: any;
}

interface LogoutResponse {
  message: string;
}

export class AuthController {
  // Register new user
  static async register(req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<AuthResponse>>) {
    try {
      const { email, password }: AuthRequest = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: data.user,
          session: data.session
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  // Login user
  static async login(req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<AuthResponse>>) {
    try {
      const { email, password }: AuthRequest = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: data.user,
          session: data.session
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  // Logout user
  static async logout(req: Request, res: Response<ApiResponse<LogoutResponse>>) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Logout successful',
        data: {
          message: 'Successfully logged out'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  // Refresh token
  static async refreshToken(req: Request<{}, {}, { refresh_token: string }>, res: Response<ApiResponse<{ session: any }>>) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          session: data.session
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({
        success: false,
        error: 'Token refresh failed'
      });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response<ApiResponse<{ user: any }>>) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }

      return res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }
}