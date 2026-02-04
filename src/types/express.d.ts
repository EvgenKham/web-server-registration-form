import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        status: string;
      };
    }

    // Добавляем типы для Response чтобы избежать конфликтов
    interface Response {
      status: (code: number) => this;
      json: (body: any) => this;
      send: (body: any) => this;
    }
  }
}