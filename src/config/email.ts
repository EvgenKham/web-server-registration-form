import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Важно: Для Gmail нужно создать App Password:
// 1. Зайдите в Google Account -> Security
// 2. Включите 2-Step Verification
// 3. Создайте App Password

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true для порта 465, false для других портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Проверка подключения к SMTP
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ SMTP сервер подключен успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к SMTP серверу:', error);
    console.log('⚠️  Письма подтверждения не будут отправляться');
  }
};

// Шаблон письма для подтверждения email
export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${process.env.APP_URL}/api/auth/verify/${verificationToken}`;

  const mailOptions = {
    from: `"User Management System" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: 'Подтверждение регистрации',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Добро пожаловать в систему управления пользователями!</h2>
        <p>Для завершения регистрации, пожалуйста, подтвердите ваш email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #1890ff;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;">
            Подтвердить Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Если вы не регистрировались в нашей системе, просто проигнорируйте это письмо.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Ссылка действительна в течение 24 часов.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Письмо подтверждения отправлено на ${email}`);
  } catch (error) {
    console.error(`❌ Ошибка отправки письма на ${email}:`, error);
    // Nota bene: Не выбрасываем ошибку, чтобы регистрация не прерывалась
    // Пользователь все равно будет зарегистрирован
  }
};

export default transporter;