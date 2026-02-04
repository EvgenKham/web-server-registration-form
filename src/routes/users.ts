import express from 'express';
import * as userController from '../controllers/userController';
import { validate } from '../validators/authValidator';
import { bulkActionSchema } from '../validators/authValidator';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Получение списка пользователей
router.get('/', userController.getAllUsers);

// Массовые действия с пользователями
router.patch('/actions', validate(bulkActionSchema), userController.bulkUserActions);

export default router;