// Модель «Позиция накладной» — таблица invoice_items.
// Промежуточная таблица: связывает накладную с товарами (одна накладная — много позиций).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  invoiceId: { type: DataTypes.INTEGER, allowNull: false }, // FK — к какой накладной относится
  productId: { type: DataTypes.INTEGER, allowNull: false }, // FK — какой товар
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // количество
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },              // цена за единицу
  total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },              // сумма позиции (кол-во × цена)
}, { tableName: 'invoice_items', timestamps: false }); // у позиций даты создания не нужны

module.exports = InvoiceItem;
