// Одноразовый скрипт проверки почты: отправляет тестовое письмо
// с vpn05uzb@gmail.com на nadira.05@mail.ru через Gmail SMTP.
//
// Запуск (или просто двойной клик по test-email.bat):
//   node --env-file=.env.local test-email.mjs
//
// Настройки берутся из .env.local:
//   EMAIL_SERVER_USER, EMAIL_SERVER_APP_PASSWORD, EMAIL_TO, EMAIL_FROM_NAME
import nodemailer from "nodemailer";

const user = process.env.EMAIL_SERVER_USER;
const pass = process.env.EMAIL_SERVER_APP_PASSWORD;
const to = process.env.EMAIL_TO;
const fromName = process.env.EMAIL_FROM_NAME || "Сайт учителя химии и биологии";

if (!user || !pass || !to) {
  console.error("ОШИБКА: не заданы настройки в .env.local");
  console.error("Нужны: EMAIL_SERVER_USER, EMAIL_SERVER_APP_PASSWORD, EMAIL_TO");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

try {
  const info = await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    to,
    subject: "✅ Тест: почта для формы обратной связи подключена!",
    text: "Проверка связи! Если вы читаете это письмо — форма обратной связи на сайте настроена правильно.\n\nС этих пор сообщения с сайта будут приходить на этот адрес.",
    html: `<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0f172a;padding:20px 28px;">
        <p style="margin:0;color:#67e8f9;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Сайт учителя химии и биологии</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">Почта подключена! 🎉</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#0f172a;">
          Это тестовое письмо. Если вы его читаете — форма обратной связи на сайте настроена правильно!
        </p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#0f172a;">
          Теперь, когда посетитель отправит сообщение через форму в разделе «Контакты», письмо вроде этого придёт на этот адрес. В письме будут имя человека, его контакт для ответа и текст сообщения — достаточно нажать «Ответить».
        </p>
        <div style="margin-top:20px;padding:14px 16px;background:#f0fdfa;border-radius:12px;border:1px solid #99f6e4;font-size:13px;line-height:1.6;color:#134e4a;">
          💡 Совет: если письмо попало в папку «Спам», отметьте его как «Не спам» — и все следующие будут приходить во «Входящие».
        </div>
      </div>
    </div>
  </body>
</html>`,
  });

  console.log("УСПЕХ! Письмо отправлено.");
  console.log("Принято сервером:", info.accepted?.join(", "));
  console.log(`Проверьте почту ${to} (и папку «Спам»).`);
} catch (error) {
  console.error("ОШИБКА отправки:", error.message);
  process.exit(1);
}
