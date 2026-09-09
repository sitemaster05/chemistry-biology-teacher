// ============================================================
// Общая логика отправки писем с формы обратной связи.
// Используется из двух мест:
//   1) api/send-email.js — серверless-функция Vercel (продакшен);
//   2) vite.config.js — локальный dev-сервер (для тестов без Vercel).
//
// Настройки передаются объектом env:
//   EMAIL_SERVER_USER         — gmail, с которого уходят письма
//   EMAIL_SERVER_APP_PASSWORD — пароль приложения Google
//   EMAIL_TO                  — адрес получателя
//   EMAIL_FROM_NAME           — имя отправителя (необязательно)
// ============================================================

import nodemailer from "nodemailer";

const GMAIL_HOST = "smtp.gmail.com";
const GMAIL_PORT = 465;

export const MAX_NAME_LENGTH = 80;
export const MAX_CONTACT_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 2000;

// Разбор и валидация данных формы.
// Возвращает:
//   { type: "honeypot" }            — заполнилось скрытое поле (спам-бот)
//   { type: "invalid", error }      — данные не прошли проверку
//   { type: "valid", data }         — готовые к отправке name/contact/message
export function parseContactPayload(body) {
  const raw = body || {};

  if (String(raw.company || "").trim()) {
    return { type: "honeypot" };
  }

  const name = String(raw.name || "").trim();
  const contact = String(raw.contact || "").trim();
  const message = String(raw.message || "").trim();

  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return { type: "invalid", error: "Некорректное имя." };
  }

  if (contact.length < 3 || contact.length > MAX_CONTACT_LENGTH) {
    return { type: "invalid", error: "Некорректный контакт." };
  }

  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return { type: "invalid", error: "Некорректный текст сообщения." };
  }

  return { type: "valid", data: { name, contact, message } };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildEmailHtml({ name, contact, message }) {
  const safeName = escapeHtml(name);
  const safeContact = escapeHtml(contact);
  const safeMessage = escapeHtml(message)
    .replace(/\r\n/g, "<br />")
    .replace(/\n/g, "<br />");

  return `<!doctype html>
<html lang="ru">
  <body style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="background:#0f172a;padding:20px 28px;">
        <p style="margin:0;color:#67e8f9;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Сайт учителя химии и биологии</p>
        <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">Новое сообщение с сайта</h1>
      </div>

      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a;">
          <tr>
            <td style="padding:8px 0;width:110px;color:#64748b;">Имя:</td>
            <td style="padding:8px 0;font-weight:bold;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Для ответа:</td>
            <td style="padding:8px 0;font-weight:bold;">${safeContact}</td>
          </tr>
        </table>

        <div style="margin-top:16px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;font-size:14px;line-height:1.7;color:#0f172a;">
          ${safeMessage}
        </div>

        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
          Это автоматическое уведомление с формы обратной связи сайта. Ответьте на письмо — ответ уйдёт на указанный контакт.
        </p>
      </div>
    </div>
  </body>
</html>`;
}

let cachedTransporter = null;

function getEmailTransport(env) {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: GMAIL_HOST,
    port: GMAIL_PORT,
    secure: true,
    auth: {
      user: env.EMAIL_SERVER_USER,
      pass: env.EMAIL_SERVER_APP_PASSWORD,
    },
  });

  return cachedTransporter;
}

export function isEmailConfigured(env) {
  return Boolean(
    env.EMAIL_SERVER_USER && env.EMAIL_SERVER_APP_PASSWORD && env.EMAIL_TO
  );
}

// Отправляет письмо с сообщением с формы. Бросает исключение при ошибке.
export async function sendContactEmail(env, { name, contact, message }) {
  const fromName = env.EMAIL_FROM_NAME || "Сайт учителя химии и биологии";

  await getEmailTransport(env).sendMail({
    from: `"${fromName}" <${env.EMAIL_SERVER_USER}>`,
    to: env.EMAIL_TO,
    replyTo: contact,
    subject: `Новое сообщение с сайта — ${name}`,
    text: `Имя: ${name}\nДля ответа: ${contact}\n\n${message}\n\n—\nАвтоматическое уведомление с формы обратной связи сайта.`,
    html: buildEmailHtml({ name, contact, message }),
  });
}
