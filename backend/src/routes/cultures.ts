import express from 'express';
import { supabase } from '../config/supabase';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateCulture } from '../middleware/validation';
import { ApiResponse, CreateCultureRequest, UpdateCultureRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all cultures for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: cultures, error } = await supabase
      .from('cultures')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: cultures
    };

    res.json(response);
  } catch (error) {
    console.error('Get cultures error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cultures'
    } as ApiResponse);
  }
});

// Get single culture by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: culture, error } = await supabase
      .from('cultures')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Culture not found'
      } as ApiResponse);
    }

    const response: ApiResponse = {
      success: true,
      data: culture
    };

    res.json(response);
  } catch (error) {
    console.error('Get culture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch culture'
    } as ApiResponse);
  }
});

// Create new culture
router.post('/', authenticateToken, validateCulture, async (req: AuthenticatedRequest, res: express.Response) => {
  try {
    const { name, cell_type, start_date, notes }: CreateCultureRequest = req.body;

    const cultureData = {
      id: uuidv4(),
      user_id: req.user!.id,
      name,
      cell_type,
      start_date: new Date(start_date).toISOString(),
      passage_number: 0,
      last_action_date: new Date().toISOString(),
      notes: notes || '',
      status: 'active' as const
    };

    const { data: culture, error } = await supabase
      .from('cultures')
      .insert([cultureData])
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
      message: 'Culture created successfully',
      data: culture
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create culture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create culture'
    } as ApiResponse);
  }
});

// Update culture
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const updateData: UpdateCultureRequest = req.body;

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const { data: culture, error } = await supabase
      .from('cultures')
      .update(cleanUpdateData)
      .eq('id', id)
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
      message: 'Culture updated successfully',
      data: culture
    };

    res.json(response);
  } catch (error) {
    console.error('Update culture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update culture'
    } as ApiResponse);
  }
});

// Delete culture
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // First delete associated tasks
    await supabase
      .from('tasks')
      .delete()
      .eq('culture_id', id)
      .eq('user_id', req.user!.id);

    // Then delete the culture
    const { error } = await supabase
      .from('cultures')
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
      message: 'Culture deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('Delete culture error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete culture'
    } as ApiResponse);
  }
});

// Update passage number (increment)
router.post('/:id/passage', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Get current culture
    const { data: currentCulture, error: fetchError } = await supabase
      .from('cultures')
      .select('passage_number')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Culture not found'
      } as ApiResponse);
    }

    // Update passage number and last action date
    const { data: culture, error } = await supabase
      .from('cultures')
      .update({
        passage_number: currentCulture.passage_number + 1,
        last_action_date: new Date().toISOString()
      })
      .eq('id', id)
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
      message: 'Passage number updated successfully',
      data: culture
    };

    res.json(response);
  } catch (error) {
    console.error('Update passage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update passage number'
    } as ApiResponse);
  }
});

export default router;
