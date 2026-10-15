
const ALLOWED_ORIGINS = [
  "https://nadiaskripetc-eng.github.io",
  "https://nova-web-site.netlify.app"
];

export default async (request) => {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : "";

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const reply = (status, message) =>
    new Response(JSON.stringify({ message }), { status, headers });

  if (!allowedOrigin) {
    return reply(403, "Джерело запиту не дозволено.");
  }

  if (request.method !== "POST") {
    return reply(405, "Метод не підтримується.");
  }

  try {
    const data = await request.json();
    const name = String(data.name || "").trim().slice(0, 100);
    const contact = String(data.contact || "").trim().slice(0, 150);
    const service = String(data.service || "").trim().slice(0, 100);
    const message = String(data.message || "").trim().slice(0, 1500);

    if (!name || !contact || !service) {
      return reply(400, "Заповни ім'я, контакт і послугу.");
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = "2139119180";

    if (!token) {
      return reply(500, "Налаштування бота відсутнє.");
    }

    const text = [
      "🔔 Нова заявка NOVA WEB",
      "",
      `Ім'я: ${name}`,
      `Контакт: ${contact}`,
      `Послуга: ${service}`,
      `Повідомлення: ${message || "—"}`
    ].join("\n");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text
        })
      }
    );

    if (!telegramResponse.ok) {
      return reply(502, "Не вдалося надіслати заявку в Telegram.");
    }

    return reply(200, "Заявку успішно надіслано!");
  } catch {
    return reply(400, "Не вдалося обробити заявку.");
  }
};
