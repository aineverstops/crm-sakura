// Главный файл сервера. Настраивает Express, подключает маршруты и запускает приложение.
require('dotenv').config(); // загрузка переменных окружения из .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

const app = express();

// CORS — разрешаем запросы только с адреса фронтенда (localhost:3000)
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // позволяет читать JSON из тела запросов

// ─── Подключение маршрутов (REST API). Каждый модуль — свой набор эндпоинтов ───
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/warehouse', require('./routes/warehouseRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Проверка работоспособности сервера
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0.0' }));

// Создание начального администратора при первом запуске (если его ещё нет)
const seedAdmin = async () => {
  const existing = await User.findOne({ where: { username: 'timur' } });
  if (!existing) {
    // Пароль хешируется через bcrypt (10 — фактор сложности) и только потом сохраняется
    const hashed = await bcrypt.hash('12345678', 10);
    await User.create({
      username: 'timur',
      password: hashed, // в базу попадает хеш, а не открытый пароль
      fullName: 'Батталов Тимур',
      role: 'admin',
      email: 'timur@crm.kz',
      isFirstLogin: true,
    });
    console.log('✅ Администратор создан: timur / 12345678');
  }
};

const PORT = process.env.PORT || 5000;

// sync({ alter: true }) — синхронизирует модели с таблицами БД (создаёт/обновляет структуру).
// После успешной синхронизации создаём админа и запускаем сервер.
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('✅ База данных синхронизирована');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`🌸 Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    // Если БД недоступна — выводим ошибку и завершаем процесс
    console.error('❌ Ошибка подключения к БД:', err.message);
    process.exit(1);
  });
