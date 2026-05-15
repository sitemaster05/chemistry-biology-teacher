export function safeExternalUrl(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url, window.location.origin);
    const allowedProtocols = ["https:", "mailto:", "tel:"];

    if (allowedProtocols.includes(parsedUrl.protocol)) {
      return url;
    }
  } catch {
    return "";
  }

  return "";
}

export function normalizeTelegramUrl(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) return "";

  if (rawValue.startsWith("@")) {
    return `https://t.me/${rawValue.slice(1)}`;
  }

  if (/^[a-zA-Z0-9_]{5,32}$/.test(rawValue)) {
    return `https://t.me/${rawValue}`;
  }

  try {
    const parsedUrl = new URL(
      rawValue.startsWith("t.me/") ? `https://${rawValue}` : rawValue
    );
    const host = parsedUrl.hostname.replace(/^www\./, "");
    const username = parsedUrl.pathname.replace(/^\/+/, "").split("/")[0];

    if (
      (host === "t.me" || host === "telegram.me") &&
      /^[a-zA-Z0-9_]{5,32}$/.test(username)
    ) {
      return `https://t.me/${username}`;
    }
  } catch {
    return "";
  }

  return "";
}
