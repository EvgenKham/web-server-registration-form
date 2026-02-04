DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login_time TIMESTAMP DEFAULT NULL,
  registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'unverified'
    CHECK (status IN ('unverified', 'active', 'blocked'))
);-- schema.sql
-- Создание таблицы users с соблюдением всех требований

-- Удаление таблицы, если она существует (для пересоздания)
DROP TABLE IF EXISTS users;

-- Создание таблицы
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    last_login_time TIMESTAMP DEFAULT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'unverified'
        CHECK (status IN ('unverified', 'active', 'blocked'))
);

-- ТРЕБОВАНИЕ 1: СОЗДАНИЕ UNIQUE INDEX НА email
-- Важно: Этот индекс обеспечивает гарантированную уникальность на уровне БД
-- При параллельных вставках БД сама позаботится о целостности
-- Nota bene: UNIQUE INDEX != PRIMARY KEY
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Дополнительные индексы для оптимизации производительности
-- INDEX для сортировки по времени последнего входа (ТРЕБОВАНИЕ 3)
CREATE INDEX idx_users_last_login_time ON users(last_login_time DESC);

-- INDEX для фильтрации по статусу
CREATE INDEX idx_users_status ON users(status);

-- INDEX для сортировки по времени регистрации
CREATE INDEX idx_users_registration_time ON users(registration_time DESC);

-- Создаем индекс для быстрого поиска по email (помимо unique индекса)
-- Этот составной индекс может быть полезен для запросов с фильтрацией
CREATE INDEX idx_users_email_status ON users(email, status);

-- Комментарии к таблице и полям (опционально, но полезно для документации)
COMMENT ON TABLE users IS 'Таблица для хранения данных пользователей системы управления';
COMMENT ON COLUMN users.status IS 'Статус пользователя: unverified, active, blocked';
COMMENT ON COLUMN users.email IS 'Уникальный email пользователя (обеспечивается UNIQUE INDEX)';

-- Проверочный запрос для демонстрации структуры
-- Выполнить после создания: SELECT * FROM information_schema.columns WHERE table_name = 'users';

CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

CREATE INDEX idx_users_last_login_time ON users(last_login_time DESC);

CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_users_registration_time ON users(registration_time DESC);

CREATE INDEX idx_users_email_status ON users(email, status);

COMMENT ON TABLE users IS 'Таблица для хранения данных пользователей системы управления';
COMMENT ON COLUMN users.status IS 'Статус пользователя: unverified, active, blocked';
COMMENT ON COLUMN users.email IS 'Уникальный email пользователя (обеспечивается UNIQUE INDEX)';
