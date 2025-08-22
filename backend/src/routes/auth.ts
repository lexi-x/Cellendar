import { Request, Response, Router } from 'express';
import { supabase } from '../config/supabase';
import { validateAuth } from '../middleware/validation';
import { ApiResponse, AuthRequest } from '../types';

const router = Router();

interface RegisterResponse {
  user: any;
  session: any;
}

// Register new user
router.post('/register', validateAuth, async (req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<RegisterResponse>>) => {
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
      } as ApiResponse);
    }

    const response: ApiResponse<RegisterResponse> = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: data.user,
        session: data.session
      }
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const errorResponse: ApiResponse<RegisterResponse> = {
      success: false,
      error: 'Registration failed',
      data: {
        user: null,
        session: null
      }
    };
    return res.status(500).json(errorResponse);
  }
});

// Login user
router.post('/login', validateAuth, async (req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<RegisterResponse>>) => {
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
      } as ApiResponse);
    }

    const response: ApiResponse<RegisterResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: data.user,
        session: data.session
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const errorResponse: ApiResponse<RegisterResponse> = {
      success: false,
      error: 'Login failed',
      data: {
        user: null,
        session: null
      }
    };
    return res.status(500).json(errorResponse);
  }
});

interface LogoutResponse {
  success: boolean;
  message: string;
}

// Logout user
router.post('/logout', async (req: Request, res: Response<ApiResponse<LogoutResponse>>) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      const errorResponse: ApiResponse<LogoutResponse> = {
        success: false,
        error: error.message,
        data: {
          success: false,
          message: 'Logout failed due to server error'
        }
      };
      return res.status(400).json(errorResponse);
    }

    const response: ApiResponse<LogoutResponse> = {
      success: true,
      message: 'Logout successful',
      data: {
        success: true,
        message: 'Successfully logged out'
      }
    };
    return res.json(response);
  } catch (error) {
    console.error('Logout error:', error);
    const errorResponse: ApiResponse<LogoutResponse> = {
      success: false,
      error: 'Logout failed',
      data: {
        success: false,
        message: 'Logout failed due to server error'
      }
    };
    return res.status(500).json(errorResponse);
  }
});

// Refresh token
router.post('/refresh', async (req: Request<{},{}, { refresh_token: string }>, res: Response<ApiResponse<{ session: any }>>) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required'
      } as ApiResponse);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        session: data.session
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed'
    } as ApiResponse);
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      } as ApiResponse);
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: { user }
    };

    res.json(response);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    } as ApiResponse);
  }
});

export default router;
