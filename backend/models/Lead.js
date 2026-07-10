// Модель «Лид» — таблица leads. Лид это потенциальный клиент (вход в воронку продаж).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(30) },
  // Источник обращения — откуда пришёл лид (для аналитики каналов)
  source: {
    type: DataTypes.ENUM('website', 'instagram', 'whatsapp', 'telegram', 'referral', 'other'),
    defaultValue: 'other',
  },
  // Стадия лида в воронке: новый → связались → квалифицирован → конвертирован → потерян
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'qualified', 'converted', 'lost'),
    defaultValue: 'new',
  },
  notes: { type: DataTypes.TEXT },
  assignedTo: { type: DataTypes.INTEGER }, // FK — менеджер, ведущий лид
}, { tableName: 'leads', timestamps: true });

module.exports = Lead;
