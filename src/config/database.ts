import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('DB connected successfully');

    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `);

    if (result.rows[0].exists) {
      console.log('Table users exist');
    } else {
      console.error('Table users not found. Check migration');
    }

    client.release();
  } catch (error) {
    console.error('Error connection DB:', error);
    process.exit(1);
  }
};

// Утилитарная функция для выполнения запросов
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query executed in ${duration}ms: ${text}`);
    return result;
  } catch (error) {
    console.error(`Database query error: ${text}`, error);
    throw error;
  }
};

// Функция для получения клиента транзакции
export const getClient = async () => {
  const client = await pool.connect();

  const query = client.query;
  const release = client.release;

  // Устанавливаем таймаут для предотвращения утечек
  const timeout = setTimeout(() => {
    console.error('DB client was used too long');
  }, 10000);

  // Переопределяем release для очистки
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.call(client);
  };

  return client;
};

export default pool;