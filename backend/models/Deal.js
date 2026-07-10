// Модель «Сделка» — таблица deals. Сделка всегда привязана к клиенту.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Deal = sequelize.define('Deal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  title: { type: DataTypes.STRING(200), allowNull: false },               // название сделки
  clientId: { type: DataTypes.INTEGER, allowNull: false },                // FK — ссылка на клиента
  amount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },            // сумма (точный тип для денег)
  // Статус сделки = колонка Kanban-доски: новая / в работе / закрыта
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'closed'),
    defaultValue: 'new',
  },
  description: { type: DataTypes.TEXT },
  closedAt: { type: DataTypes.DATE }, // дата закрытия сделки
}, { tableName: 'deals', timestamps: true });

module.exports = Deal;
