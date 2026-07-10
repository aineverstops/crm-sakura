// Токен Telegram-бота берётся из переменной окружения (.env, файл не попадает в git).
// Локально задайте VITE_TG_BOT_TOKEN в frontend/.env (см. frontend/.env.example).
const TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || 'ВСТАВЬТЕ_ТОКЕН_БОТА';
const BASE   = `https://api.telegram.org/bot${TOKEN}`;

/** Получить новые обновления (входящие сообщения) */
export const tgGetUpdates = (offset = 0) =>
  fetch(`${BASE}/getUpdates?offset=${offset}&limit=100`)
    .then((r) => r.json())
    .then((d) => (d.ok ? d.result : []))
    .catch(() => []);

/** Отправить сообщение в чат */
export const tgSendMessage = (chatId, text) =>
  fetch(`${BASE}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text }),
  })
    .then((r) => r.json())
    .catch(() => null);

/** Проверить токен / получить данные бота */
export const tgGetMe = () =>
  fetch(`${BASE}/getMe`)
    .then((r) => r.json())
    .catch(() => null);

/** Удалить webhook (нужно для работы polling) */
export const tgDeleteWebhook = () =>
  fetch(`${BASE}/deleteWebhook?drop_pending_updates=false`)
    .then((r) => r.json())
    .catch(() => null);
