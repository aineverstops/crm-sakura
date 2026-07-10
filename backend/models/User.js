// Модель «Пользователь» (сотрудник) — таблица users. Используется для входа в систему.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },   // PK
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true }, // логин (уникальный)
  password: { type: DataTypes.STRING(255), allowNull: false },              // ХЕШ пароля (не сам пароль!)
  fullName: { type: DataTypes.STRING(100), allowNull: false },
  // Роль: admin (полный доступ) или manager (обычный сотрудник)
  role: { type: DataTypes.ENUM('admin', 'manager'), defaultValue: 'manager' },
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  avatar: { type: DataTypes.STRING(255) },
  isFirstLogin: { type: DataTypes.BOOLEAN, defaultValue: true }, // первый вход (для онбординга)
}, { tableName: 'users', timestamps: true });

module.exports = User;
