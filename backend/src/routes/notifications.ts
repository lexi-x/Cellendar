import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = express.Router();

// Get notification settings for authenticated user
router.get('/settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: settings
    };

    res.json(response);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification settings'
    } as ApiResponse);
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { enabled, default_reminder_hours, overdue_alerts } = req.body;

    const updateData = {
      enabled,
      default_reminder_hours,
      overdue_alerts
    };

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const { data: settings, error } = await supabase
      .from('notification_settings')
      .update(cleanUpdateData)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Notification settings updated successfully',
      data: settings
    };

    res.json(response);
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update notification settings'
    } as ApiResponse);
  }
});

export default router;
