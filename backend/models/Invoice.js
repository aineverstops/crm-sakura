// Модель «Накладная» — таблица invoices. Приходные/расходные накладные склада.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  number: { type: DataTypes.STRING(30), allowNull: false, unique: true }, // номер накладной (уникальный)
  clientId: { type: DataTypes.INTEGER, allowNull: false },                // FK — клиент
  // Тип: incoming — приход (товар поступает), outgoing — расход (товар уходит)
  type: { type: DataTypes.ENUM('incoming', 'outgoing'), defaultValue: 'outgoing' },
  totalAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 }, // итоговая сумма
  // Статус документа
  status: {
    type: DataTypes.ENUM('draft', 'issued', 'paid', 'cancelled'),
    defaultValue: 'draft',
  },
  notes: { type: DataTypes.TEXT },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // дата выставления
}, { tableName: 'invoices', timestamps: true });

module.exports = Invoice;
