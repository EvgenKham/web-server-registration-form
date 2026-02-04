// src/models/User.ts
import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Определим интерфейс для результата запроса
interface QueryResult {
  rows: any[];
  rowCount: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  last_login_time: Date | null;
  registration_time: Date;
  status: 'unverified' | 'active' | 'blocked';
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
}

export interface UserUpdate {
  name?: string;
  status?: 'unverified' | 'active' | 'blocked';
  last_login_time?: Date;
}

class UserModel {
  // Создание нового пользователя
  static async create(userData: UserInput): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    const result: QueryResult = await query(
      `INSERT INTO users (name, email, password_hash, status)
       VALUES ($1, $2, $3, 'unverified')
       RETURNING id, name, email, last_login_time, registration_time, status`,
      [userData.name, userData.email, password_hash]
    );

    return result.rows[0];
  }

  // Поиск пользователя по email
  static async findByEmail(email: string): Promise<User | null> {
    const result: QueryResult = await query(
      `SELECT id, name, email, password_hash, last_login_time,
              registration_time, status
       FROM users
       WHERE email = $1`,
      [email]
    );

    return result.rows[0] || null;
  }

  // Поиск пользователя по ID
  static async findById(id: number): Promise<User | null> {
    const result: QueryResult = await query(
      `SELECT id, name, email, password_hash, last_login_time,
              registration_time, status
       FROM users
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  // Обновление пользователя
  static async update(id: number, updates: UserUpdate): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);

    const result: QueryResult = await query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, name, email, last_login_time, registration_time, status`,
      values
    );

    return result.rows[0] || null;
  }

  // Удаление пользователя (физическое удаление)
  static async delete(id: number): Promise<boolean> {
    const result: QueryResult = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    // Проверяем, что rowCount не null
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Удаление пользователей по статусу
  static async deleteByStatus(status: 'unverified'): Promise<number> {
    const result: QueryResult = await query(
      'DELETE FROM users WHERE status = $1',
      [status]
    );

    // Возвращаем 0 если rowCount null
    return result.rowCount || 0;
  }

  // Получение всех пользователей с сортировкой
  static async getAll(): Promise<User[]> {
    // ТРЕБОВАНИЕ 3: Сортировка по last_login_time
    const result: QueryResult = await query(
      `SELECT id, name, email, last_login_time, registration_time, status
       FROM users
       ORDER BY last_login_time DESC NULLS LAST`
    );

    return result.rows;
  }

  // Массовое обновление статуса
  static async bulkUpdateStatus(
    ids: number[],
    status: 'active' | 'blocked'
  ): Promise<number> {
    const result: QueryResult = await query(
      `UPDATE users
       SET status = $1
       WHERE id = ANY($2::int[])
       RETURNING id`,
      [status, ids]
    );

    return result.rowCount || 0;
  }

  // Массовое удаление
  static async bulkDelete(ids: number[]): Promise<number> {
    const result: QueryResult = await query(
      'DELETE FROM users WHERE id = ANY($1::int[]) RETURNING id',
      [ids]
    );

    return result.rowCount || 0;
  }

  // Проверка пароля
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Генерация JWT токена
  static generateToken(userId: number): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Верификация JWT токена
  static verifyToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    } catch (error) {
      return null;
    }
  }

  // Проверка существует ли пользователь и не заблокирован ли он
  static async existsAndNotBlocked(userId: number): Promise<boolean> {
    // ТРЕБОВАНИЕ 5: Проверка перед каждым запросом
    const result: QueryResult = await query(
      `SELECT id FROM users WHERE id = $1 AND status != 'blocked'`,
      [userId]
    );

    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Утилитарная функция для получения уникального ID
  static getUniqIdValue(user: User): number {
    return user.id;
  }
}

export default UserModel;