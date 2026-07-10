// Модель «Клиент» — описывает таблицу clients в базе данных.
// Sequelize по этому описанию сам создаёт таблицу с нужными полями и типами.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  // Первичный ключ (PK) — уникальный номер, генерируется автоматически
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false }, // имя обязательно
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(30) },
  company: { type: DataTypes.STRING(100) },
  address: { type: DataTypes.TEXT },
  avatar: { type: DataTypes.STRING(255) },
  notes: { type: DataTypes.TEXT },
  // ARRAY — нативный тип массива PostgreSQL: список тегов клиента
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  // ENUM — статус ограничен фиксированным списком значений; по умолчанию «активный»
  status: { type: DataTypes.ENUM('new', 'active', 'inactive', 'regular'), defaultValue: 'active' },
}, { tableName: 'clients', timestamps: true }); // timestamps: добавляет createdAt и updatedAt

module.exports = Client;
