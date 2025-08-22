import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateTask } from '../middleware/validation';
import { ApiResponse, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all tasks for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { culture_id, completed } = req.query;
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .eq('user_id', req.user!.id);

    if (culture_id) {
      query = query.eq('culture_id', culture_id);
    }

    if (completed !== undefined) {
      query = query.eq('is_completed', completed === 'true');
    }

    query = query.order('scheduled_date', { ascending: true });

    const { data: tasks, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: tasks
    };

    res.json(response);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    } as ApiResponse);
  }
});

// Get single task by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: task
    };

    res.json(response);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch task'
    } as ApiResponse);
  }
});

// Create new task
router.post('/', authenticateToken, validateTask, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { culture_id, type, title, description, scheduled_date, reminder_hours }: CreateTaskRequest = req.body;

    // Verify culture belongs to user
    const { data: culture, error: cultureError } = await supabase
      .from('cultures')
      .select('id')
      .eq('id', culture_id)
      .eq('user_id', req.user!.id)
      .single();

    if (cultureError) {
      return res.status(404).json({
        success: false,
        error: 'Culture not found'
      } as ApiResponse);
    }

    const taskData = {
      id: uuidv4(),
      user_id: req.user!.id,
      culture_id,
      type,
      title,
      description: description || null,
      scheduled_date: new Date(scheduled_date).toISOString(),
      reminder_hours: reminder_hours || 2,
      is_completed: false
    };

    const { data: task, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task created successfully',
      data: task
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task'
    } as ApiResponse);
  }
});

// Update task
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;

    // Remove undefined values and handle date conversion
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => {
          if (key === 'scheduled_date' && typeof value === 'string') {
            return [key, new Date(value).toISOString()];
          }
          return [key, value];
        })
    );

    const { data: task, error } = await supabase
      .from('tasks')
      .update(cleanUpdateData)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task
    };

    res.json(response);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task'
    } as ApiResponse);
  }
});

// Complete task
router.post('/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        is_completed: true,
        completed_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task completed successfully',
      data: task
    };

    res.json(response);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete task'
    } as ApiResponse);
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    } as ApiResponse);
  }
});

// Get today's tasks
router.get('/today/list', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .eq('user_id', req.user!.id)
      .gte('scheduled_date', startOfDay)
      .lte('scheduled_date', endOfDay)
      .order('scheduled_date', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: tasks
    };

    res.json(response);
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s tasks'
    } as ApiResponse);
  }
});

// Get overdue tasks
router.get('/overdue/list', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const now = new Date().toISOString();

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        cultures (
          id,
          name,
          status
        )
      `)
      .eq('user_id', req.user!.id)
      .eq('is_completed', false)
      .lt('scheduled_date', now)
      .order('scheduled_date', { ascending: true });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: tasks
    };

    res.json(response);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue tasks'
    } as ApiResponse);
  }
});

export default router;
