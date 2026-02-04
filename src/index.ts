import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { testConnection } from './config/database';
import { verifyEmailConnection } from './config/email';

// Загружаем переменные окружения
dotenv.config();

// Создаем Express приложение
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware для безопасности
app.use(helmet());

// Middleware для CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Middleware для логирования
app.use(morgan('dev'));

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Тестовые endpoints для проверки
app.get('/', (req, res) => {
  res.json({
    message: 'User Management API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// Обработка 404
app.use(notFoundHandler);

// Обработка ошибок
app.use(errorHandler);

// Функция запуска сервера
const startServer = async () => {
  try {
    // Проверяем подключение к базе данных
    await testConnection();

    // Проверяем подключение к email сервису
    await verifyEmailConnection();

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`🌍 Режим: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Запускаем сервер
startServer();