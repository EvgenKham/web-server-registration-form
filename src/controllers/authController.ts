import { Request, Response } from 'express';
import UserModel from '../models/User';
import { sendVerificationEmail } from '../config/email';
import { asyncHandler } from '../middlewares/errorHandler';
import { v4 as uuidv4 } from 'uuid';

// Регистрация пользователя
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Важно: Пользователь регистрируется сразу
  const user = await UserModel.create({ name, email, password });

  // Отправляем email подтверждения АСИНХРОННО
  const verificationToken = uuidv4();
  // В реальном приложении нужно сохранить токен в БД с expiration
  sendVerificationEmail(email, verificationToken).catch(console.error);

  // Генерируем токен для автоматического входа
  const token = UserModel.generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Регистрация успешна. На ваш email отправлено письмо для подтверждения.',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
      token,
    },
  });
});

// Вход пользователя
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Находим пользователя по email
  const user = await UserModel.findByEmail(email);

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Неверный email или пароль.',
    });
    return;
  }

  // 2. Проверяем, не заблокирован ли пользователь
  if (user.status === 'blocked') {
    res.status(403).json({
      success: false,
      message: 'Ваш аккаунт заблокирован. Обратитесь к администратору.',
    });
    return;
  }

  // 3. Проверяем пароль
  const isPasswordValid = await UserModel.verifyPassword(
    password,
    user.password_hash
  );

  if (!isPasswordValid) {
    res.status(401).json({
      success: false,
      message: 'Неверный email или пароль.',
    });
    return;
  }

  // 4. Обновляем время последнего входа
  await UserModel.update(user.id, {
    last_login_time: new Date(),
  });

  // 5. Генерируем токен
  const token = UserModel.generateToken(user.id);

  res.json({
    success: true,
    message: 'Вход выполнен успешно.',
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        last_login_time: user.last_login_time,
        registration_time: user.registration_time,
      },
      token,
    },
  });
});

// Подтверждение email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  if (Array.isArray(token)) {
    res.status(400).json({
      success: false,
      message: 'Неверный формат токена подтверждения.',
    });
    return;
  }

  // В реальном приложении нужно:
  // 1. Проверить токен в БД
  // 2. Проверить его срок действия
  // 3. Найти пользователя по токену

  // Для упрощения: считаем, что токен это email закодированный в base64
  try {
    const email = Buffer.from(token, 'base64').toString('utf-8');
    const user = await UserModel.findByEmail(email);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Пользователь не найден.',
      });
      return;
    }

    // ТРЕБОВАНИЕ: Блокированные пользователи остаются блокированными
    if (user.status === 'blocked') {
      res.json({
        success: true,
        message: 'Email подтвержден, но аккаунт остается заблокированным.',
      });
      return;
    }

    // Меняем статус только если он был unverified
    if (user.status === 'unverified') {
      await UserModel.update(user.id, { status: 'active' });
    }

    // Редирект на фронтенд или показ сообщения
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?verified=true`);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Недействительный токен подтверждения.',
    });
  }
});

// Получение текущего пользователя
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Пользователь не аутентифицирован.',
    });
    return;
  }

  const user = await UserModel.findById(req.user.id);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'Пользователь не найден.',
    });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        last_login_time: user.last_login_time,
        registration_time: user.registration_time,
      },
    },
  });
});

// Выход
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // В JWT-аутентификации выход происходит на клиенте (удаление токена)
  // Здесь можно добавить логику для blacklist токенов если нужно

  res.json({
    success: true,
    message: 'Выход выполнен успешно.',
  });
});