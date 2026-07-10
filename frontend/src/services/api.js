// Настроенный экземпляр axios — через него весь фронтенд общается с бэкендом.
import axios from 'axios';

// Базовый адрес: все запросы идут на /api (проксируется на сервер :5000)
const api = axios.create({
  baseURL: '/api',
  timeout: 10000, // макс. 10 сек на запрос
});

// ПЕРЕХВАТЧИК ЗАПРОСОВ: перед каждым запросом автоматически подставляем JWT-токен.
// Так не нужно вручную добавлять токен в каждый запрос.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // токен сохранён при входе
  if (token) config.headers.Authorization = `Bearer ${token}`; // стандартный заголовок авторизации
  return config;
});

// ПЕРЕХВАТЧИК ОТВЕТОВ: если сервер ответил 401/403 (токен невалиден или истёк) —
// удаляем токен и перенаправляем на страницу входа.
api.interceptors.response.use(
  (res) => res, // успешный ответ пропускаем как есть
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err); // ошибку прокидываем дальше для обработки
  }
);

export default api;
