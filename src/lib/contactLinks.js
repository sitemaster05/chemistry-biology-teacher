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

  const mentionMatch = rawValue.match(/@([a-zA-Z0-9_]{5,32})/);

  if (mentionMatch) {
    return `https://t.me/${mentionMatch[1]}`;
  }

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
    const path = parsedUrl.pathname.replace(/^\/+/, "");
    const username = path.split("/")[0];

    if (parsedUrl.protocol === "tg:") {
      const domain = parsedUrl.searchParams.get("domain");

      if (domain && /^[a-zA-Z0-9_]{5,32}$/.test(domain)) {
        return `https://t.me/${domain}`;
      }
    }

    if (host !== "t.me" && host !== "telegram.me") {
      return "";
    }

    if (!path) {
      return "";
    }

    if (/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
      return `https://t.me/${username}${parsedUrl.search}`;
    }

    return `https://t.me/${path}${parsedUrl.search}`;
  } catch {
    return "";
  }
}
