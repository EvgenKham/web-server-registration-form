import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Валидация для регистрации
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Имя обязательно для заполнения',
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя должно содержать максимум 100 символов',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email обязателен для заполнения',
      'string.email': 'Введите корректный email адрес',
    }),

  password: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Пароль обязателен для заполнения',
      'string.min': 'Пароль должен содержать минимум 1 символ',
    }),
});

// Валидация для входа
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email обязателен для заполнения',
      'string.email': 'Введите корректный email адрес',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Пароль обязателен для заполнения',
    }),
});

// Валидация для массовых действий с пользователями
export const bulkActionSchema = Joi.object({
  userIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'array.min': 'Выберите хотя бы одного пользователя',
      'any.required': 'Список пользователей обязателен',
    }),

  action: Joi.string()
    .valid('block', 'unblock', 'delete', 'deleteUnverified')
    .required()
    .messages({
      'any.only': 'Недопустимое действие',
      'any.required': 'Действие обязательно',
    }),
});

// Middleware для валидации
export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors
      });
      return;
    }

    next();
  };
};

// Альтернативная реализация с явным указанием типов
export const validateBody = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationResult = schema.validate(req.body, { abortEarly: false });

    if (validationResult.error) {
      const errorMessages = validationResult.error.details.map(detail => detail.message);
      const response = res.status(400).json({
        success: false,
        message: 'Ошибка валидации входных данных',
        errors: errorMessages,
      });
      return;
    }

    next();
  };
};