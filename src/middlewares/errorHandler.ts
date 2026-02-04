// src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

// Интерфейс для кастомных ошибок
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// Middleware для обработки ошибок
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('🔥 Ошибка:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';

  // Обработка ошибок PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Пользователь с таким email уже существует.';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Нарушение ссылочной целостности данных.';
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        message = 'Обязательные поля не заполнены.';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Неверный формат данных.';
        break;
    }
  }

  // Обработка JWT ошибок
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Недействительный токен.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Срок действия токена истек.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // В разработке показываем stack trace
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware для обработки 404
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: AppError = new Error(`Не найден - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Обертка для асинхронных функций (чтобы не писать try-catch в каждом контроллере)
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};