import { Request, Response } from 'express';
import UserModel from '../models/User';
import { asyncHandler } from '../middlewares/errorHandler';

// Получение всех пользователей
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await UserModel.getAll();

  // ТРЕБОВАНИЕ 4: Преобразуем данные для фронтенда с чекбоксами
  const usersWithSelection = users.map(user => ({
    ...user,
    // Добавляем поле для чекбокса (не сохраняется в БД)
    key: user.id, // Для Ant Design Table
  }));

  res.json({
    success: true,
    data: usersWithSelection,
    count: users.length,
  });
});

// Массовые действия с пользователями
export const bulkUserActions = asyncHandler(async (req: Request, res: Response) => {
  const { userIds, action } = req.body;

  let message = '';
  let affectedCount = 0;

  switch (action) {
    case 'block':
      affectedCount = await UserModel.bulkUpdateStatus(userIds, 'blocked');
      message = `Заблокировано пользователей: ${affectedCount}`;
      break;

    case 'unblock':
      affectedCount = await UserModel.bulkUpdateStatus(userIds, 'active');
      message = `Разблокировано пользователей: ${affectedCount}`;
      break;

    case 'delete':
      affectedCount = await UserModel.bulkDelete(userIds);
      message = `Удалено пользователей: ${affectedCount}`;
      break;

    case 'deleteUnverified':
      // Nota bene: Удаляем только unverified пользователей
      // ТРЕБОВАНИЕ: Физическое удаление, не пометка
      affectedCount = await UserModel.deleteByStatus('unverified');
      message = `Удалено неподтвержденных пользователей: ${affectedCount}`;
      break;

    default:
      res.status(400).json({
        success: false,
        message: 'Недопустимое действие.',
      });
      return;
  }

  // Проверяем, был ли среди удаленных/заблокированных текущий пользователь
  if (req.user && userIds.includes(req.user.id)) {
    // Если текущий пользователь заблокировал или удалил себя
    // Фронтенд должен обработать это и сделать logout

    res.json({
      success: true,
      message,
      affectedCount,
      currentUserAffected: true,
    });
    return;
  }

  res.json({
    success: true,
    message,
    affectedCount,
  });
});

// Утилитарная функция для получения уникального ID (ТРЕБОВАНИЕ)
// Important: Эта функция используется для получения значения уникального ID
export const getUniqIdValue = (user: any): number => {
  // В нашем случае это просто user.id
  // Но функция может быть расширена для других типов ID
  return user.id;
};