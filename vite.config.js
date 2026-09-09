import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {
  parseContactPayload,
  sendContactEmail,
  isEmailConfigured,
} from "./server/email-core.js";

// ============================================================
// Локальный /api/send-email для dev-сервера.
// На проде эту работу выполняет Vercel-функция api/send-email.js,
// а локально — этот плагин, чтобы форму можно было тестировать
// без деплоя. Настройки читаются из .env.local.
// ============================================================
function localSendEmailApi() {
  return {
    name: "local-send-email-api",
    configureServer(server) {
      server.middlewares.use("/api/send-email", async (req, res) => {
        const send = (status, data) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(data));
        };

        if (req.method !== "POST") {
          return send(405, { ok: false, error: "Method not allowed" });
        }

        let body = "";
        for await (const chunk of req) {
          body += chunk;
        }

        let parsed;
        try {
          parsed = JSON.parse(body || "{}");
        } catch {
          return send(400, { ok: false, error: "Некорректный запрос." });
        }

        const result = parseContactPayload(parsed);

        if (result.type === "honeypot") {
          return send(200, { ok: true });
        }

        if (result.type === "invalid") {
          return send(400, { ok: false, error: result.error });
        }

        const env = loadEnv(server.config.mode, server.config.root, "");

        if (!isEmailConfigured(env)) {
          return send(500, {
            ok: false,
            error: "Почта не настроена в .env.local.",
          });
        }

        try {
          await sendContactEmail(env, result.data);
          return send(200, { ok: true });
        } catch (error) {
          server.config.logger.error(`[send-email] ${error.message}`);
          return send(500, { ok: false, error: "Не удалось отправить письмо." });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localSendEmailApi()],
});
