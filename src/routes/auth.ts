import express from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../validators/authValidator';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

// Публичные маршруты (не требуют аутентификации)
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify/:token', authController.verifyEmail);

// Защищенные маршруты (требуют аутентификации)
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

export default router;