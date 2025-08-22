import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    };
    return res.status(400).json(response);
  }
  next();
};

export const validateAuth = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  handleValidationErrors
];

export const validateCulture = [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('cell_type').trim().isLength({ min: 1, max: 100 }),
  body('start_date').isISO8601(),
  body('notes').optional().trim().isLength({ max: 1000 }),
  handleValidationErrors
];

export const validateTask = [
  body('culture_id').isUUID(),
  body('type').isIn(['media_change', 'passaging', 'observation']),
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('scheduled_date').isISO8601(),
  body('reminder_hours').optional().isInt({ min: 0, max: 168 }),
  handleValidationErrors
];
