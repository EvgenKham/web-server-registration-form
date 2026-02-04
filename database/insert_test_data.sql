-- insert_test_data.sql
-- Вставка тестовых данных для проверки

-- Вставляем тестовых пользователей
-- Nota bene: Обратите внимание на уникальность email
INSERT INTO users (name, email, password_hash, status, last_login_time)
VALUES
    ('Администратор', 'admin@example.com', 'hashed_password_1', 'active', '2024-01-15 10:30:00'),
    ('Иван Петров', 'ivan@example.com', 'hashed_password_2', 'active', '2024-01-14 15:45:00'),
    ('Мария Сидорова', 'maria@example.com', 'hashed_password_3', 'unverified', NULL),
    ('Алексей Блокированный', 'blocked@example.com', 'hashed_password_4', 'blocked', '2024-01-10 09:15:00'),
    ('Тест Пользователь', 'test@example.com', 'hashed_password_5', 'active', '2024-01-13 14:20:00');

-- Проверка уникальности email (этот запрос должен вызвать ошибку)
-- INSERT INTO users (name, email, password_hash, status)
-- VALUES ('Дубликат', 'admin@example.com', 'hash', 'active');
-- Ожидаемая ошибка: duplicate key value violates unique constraint "idx_users_email_unique"