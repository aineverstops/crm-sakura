// Подключение к базе данных PostgreSQL через ORM Sequelize.
// Все параметры подключения берутся из файла .env (переменные окружения).
const { Sequelize } = require('sequelize');
require('dotenv').config(); // загружает переменные из .env в process.env

// Создаём единственный экземпляр Sequelize — через него работает вся БД
const sequelize = new Sequelize(
  process.env.DB_NAME,      // имя базы данных
  process.env.DB_USER,      // пользователь БД
  process.env.DB_PASSWORD,  // пароль
  {
    host: process.env.DB_HOST, // адрес сервера БД (обычно localhost)
    port: process.env.DB_PORT, // порт PostgreSQL (по умолчанию 5432)
    dialect: 'postgres',       // тип СУБД — PostgreSQL
    logging: false,            // не выводить SQL-запросы в консоль
    // Пул соединений — переиспользует подключения вместо создания нового на каждый запрос
    pool: {
      max: 10,        // максимум одновременных соединений
      min: 0,         // минимум
      acquire: 30000, // макс. время ожидания соединения (мс)
      idle: 10000,    // через сколько мс простоя закрыть соединение
    },
  }
);

module.exports = sequelize; // экспортируем для использования в моделях и контроллерах
