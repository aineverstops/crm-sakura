// Модель «Товар» — таблица products. Основа модуля складского учёта.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  name: { type: DataTypes.STRING(200), allowNull: false },
  sku: { type: DataTypes.STRING(50), unique: true }, // артикул, уникальный
  barcode: { type: DataTypes.STRING(50) },
  unit: { type: DataTypes.STRING(20), defaultValue: 'шт' }, // единица измерения
  price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },     // цена продажи
  costPrice: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 }, // себестоимость
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },        // текущий остаток на складе
  minQuantity: { type: DataTypes.INTEGER, defaultValue: 5 },     // мин. остаток (для предупреждения)
  category: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
}, { tableName: 'products', timestamps: true });

module.exports = Product;
