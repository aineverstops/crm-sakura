// Точка сборки всех моделей и описание связей (ассоциаций) между таблицами.
// Здесь формируется ER-схема: какие таблицы как связаны друг с другом.
const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Deal = require('./Deal');
const Task = require('./Task');
const Lead = require('./Lead');
const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');

// ─── Связи между таблицами (один-ко-многим) ───

// У одного клиента может быть много сделок; каждая сделка принадлежит одному клиенту
Client.hasMany(Deal, { foreignKey: 'clientId', as: 'deals' });
Deal.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// У одного клиента может быть много задач
Client.hasMany(Task, { foreignKey: 'clientId', as: 'tasks' });
Task.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Задачи закрепляются за сотрудником (исполнителем)
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Лид закреплён за менеджером (сотрудником)
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'manager' });

// Накладная состоит из множества позиций; каждая позиция принадлежит одной накладной
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// Накладная привязана к клиенту, а каждая позиция — к товару со склада
Invoice.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
InvoiceItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Экспортируем sequelize и все модели единым объектом
module.exports = {
  sequelize,
  User,
  Client,
  Deal,
  Task,
  Lead,
  Product,
  Invoice,
  InvoiceItem,
};
