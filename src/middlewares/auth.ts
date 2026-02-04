// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';

// Расширяем интерфейс Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        status: string;
      };
    }
  }
}

// Middleware для проверки JWT и статуса пользователя
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Требуется аутентификация. Token не предоставлен.'
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // 2. Верифицируем токен
    const decoded = UserModel.verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Недействительный или просроченный токен.'
      });
      return;
    }

    // 3. Проверяем существует ли пользователь и не заблокирован ли он
    // ТРЕБОВАНИЕ 5: Проверка перед каждым запросом
    const userExists = await UserModel.existsAndNotBlocked(decoded.userId);

    if (!userExists) {
      res.status(403).json({
        success: false,
        message: 'Пользователь не найден или заблокирован.'
      });
      return;
    }

    // 4. Получаем полную информацию о пользователе
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      res.status(403).json({
        success: false,
        message: 'Пользователь не найден.'
      });
      return;
    }

    // 5. Добавляем информацию о пользователе в запрос
    req.user = {
      id: user.id,
      email: user.email,
      status: user.status,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера при аутентификации.'
    });
  }
};

// Middleware для проверки ролей (если понадобится в будущем)
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Здесь можно добавить проверку ролей
  // В текущей задаче все аутентифицированные пользователи имеют одинаковые права
  next();
};