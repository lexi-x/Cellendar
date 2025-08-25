import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateAuth } from '../middleware/validation';

const router = Router();

// Register new user
router.post('/register', validateAuth, AuthController.register);
router.post('/login', validateAuth, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.get('/profile', AuthController.getProfile);

export default router;
