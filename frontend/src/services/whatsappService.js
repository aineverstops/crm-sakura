// Данные Green API берутся из переменных окружения (.env, файл не попадает в git).
// Локально создайте frontend/.env со своими значениями (см. frontend/.env.example).
const ID_INSTANCE = import.meta.env.VITE_WA_ID_INSTANCE || 'ВСТАВЬТЕ_ID_INSTANCE';
const API_TOKEN   = import.meta.env.VITE_WA_API_TOKEN   || 'ВСТАВЬТЕ_API_TOKEN';
const BASE        = `https://7107.api.greenapi.com/waInstance${ID_INSTANCE}`;

/** Получить следующее уведомление из очереди (long polling, ~5-25 сек ожидания) */
export const waReceiveNotification = () =>
  fetch(`${BASE}/receiveNotification/${API_TOKEN}`)
    .then((r) => r.json())
    .catch(() => null);

/** Удалить обработанное уведомление из очереди */
export const waDeleteNotification = (receiptId) =>
  fetch(`${BASE}/deleteNotification/${API_TOKEN}/${receiptId}`, { method: 'DELETE' })
    .then((r) => r.json())
    .catch(() => null);

/** Отправить текстовое сообщение (chatId в формате 7XXXXXXXXXX@c.us) */
export const waSendMessage = (chatId, message) =>
  fetch(`${BASE}/sendMessage/${API_TOKEN}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chatId, message }),
  })
    .then((r) => r.json())
    .catch(() => null);

/** Проверить статус авторизации инстанса */
export const waGetStateInstance = () =>
  fetch(`${BASE}/getStateInstance/${API_TOKEN}`)
    .then((r) => r.json())
    .catch(() => null);
