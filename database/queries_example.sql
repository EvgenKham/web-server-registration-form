-- queries_examples.sql
-- Примеры запросов, которые будут использоваться в приложении

-- 1. Получить всех пользователей, отсортированных по last_login_time (ТРЕБОВАНИЕ 3)
SELECT id, name, email, last_login_time, registration_time, status
FROM users
ORDER BY last_login_time DESC NULLS LAST;

-- 2. Найти пользователя по email (для входа)
SELECT id, name, email, password_hash, status
FROM users
WHERE email = 'admin@example.com';

-- 3. Обновить время последнего входа
UPDATE users
SET last_login_time = CURRENT_TIMESTAMP
WHERE id = 1;

-- 4. Изменить статус пользователя
UPDATE users
SET status = 'blocked'
WHERE id = 3;

-- 5. Удаление пользователя (ТРЕБОВАНИЕ: физическое удаление)
DELETE FROM users WHERE id = 5;

-- 6. Массовое удаление по статусу
DELETE FROM users WHERE status = 'unverified';

-- 7. Проверка существования и статуса пользователя (ТРЕБОВАНИЕ 5)
SELECT id, status
FROM users
WHERE id = 1 AND status != 'blocked';
-- Если запрос вернет строку - пользователь существует и не заблокирован
-- Если NULL - пользователь не найден или заблокирован