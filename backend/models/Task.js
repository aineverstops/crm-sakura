// Модель «Задача» — таблица tasks. Задачи менеджеров, могут быть привязаны к клиенту.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }, // PK
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  clientId: { type: DataTypes.INTEGER },   // FK — клиент (необязательно)
  assignedTo: { type: DataTypes.INTEGER }, // FK — исполнитель (сотрудник)
  deadline: { type: DataTypes.DATE },      // срок выполнения
  // Статус выполнения: к выполнению / в работе / выполнено
  status: {
    type: DataTypes.ENUM('todo', 'in_progress', 'done'),
    defaultValue: 'todo',
  },
  // Приоритет задачи
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
}, { tableName: 'tasks', timestamps: true });

module.exports = Task;
