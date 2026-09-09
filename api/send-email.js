import {
  parseContactPayload,
  sendContactEmail,
  isEmailConfigured,
} from "../server/email-core.js";

// ============================================================
// Vercel serverless-функция: POST /api/send-email
// Отправляет письмо с сообщением из формы через Gmail SMTP.
// Настройки — переменные окружения Vercel (Settings ->
// Environment Variables): EMAIL_SERVER_USER,
// EMAIL_SERVER_APP_PASSWORD, EMAIL_TO, EMAIL_FROM_NAME.
// Локально эту же работу делает плагин в vite.config.js.
// ============================================================

// Лёгкий rate-limit: не больше 8 писем в час с одного IP.
// В serverless-окружении счётчик живёт в рамках одного инстанса —
// это «best effort» защита, основная защита — honeypot и валидация.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
const rateHits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const list = (rateHits.get(ip) || []).filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );

  if (list.length >= RATE_LIMIT_MAX) {
    rateHits.set(ip, list);
    return true;
  }

  list.push(now);
  rateHits.set(ip, list);
  return false;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ ok: false, error: "Method not allowed" });
  }

  const result = parseContactPayload(request.body);

  // Honeypot: боты заполняют скрытое поле — молча показываем им «успех».
  if (result.type === "honeypot") {
    return response.status(200).json({ ok: true });
  }

  if (result.type === "invalid") {
    return response.status(400).json({ ok: false, error: result.error });
  }

  const env = {
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_APP_PASSWORD: process.env.EMAIL_SERVER_APP_PASSWORD,
    EMAIL_TO: process.env.EMAIL_TO,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  };

  if (!isEmailConfigured(env)) {
    return response.status(500).json({
      ok: false,
      error: "Почта не настроена: не заданы переменные окружения.",
    });
  }

  const ip =
    request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return response
      .status(429)
      .json({ ok: false, error: "Слишком много сообщений. Попробуйте позже." });
  }

  try {
    await sendContactEmail(env, result.data);
    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("send-email error:", error.message);
    return response
      .status(500)
      .json({ ok: false, error: "Не удалось отправить письмо." });
  }
}
