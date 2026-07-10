// Контроллер клиентов: CRUD-операции (создание, чтение, обновление, удаление) + поиск.
const { Client, Deal, Task } = require('../models');
const { Op } = require('sequelize'); // операторы Sequelize (для поиска по нескольким полям)

// Получить всех клиентов; если передан ?search= — фильтруем по нескольким полям сразу
const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? {
          // Op.or — «ИЛИ»: совпадение по имени ИЛИ компании ИЛИ email ИЛИ телефону.
          // Op.iLike — поиск без учёта регистра, % — любая часть строки.
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
            { company: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};
    const clients = await Client.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить одного клиента по id вместе с его сделками и задачами (для карточки клиента)
const getById = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id, {
      include: [
        { association: 'deals' },
        { association: 'tasks' },
      ],
    });
    if (!client) return res.status(404).json({ message: 'Клиент не найден' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Создать клиента
const create = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Обновить клиента (в т.ч. сменить статус: новый/активный/неактивный/постоянный)
const update = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Клиент не найден' });
    await client.update(req.body); // req.body содержит все изменённые поля
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Удалить клиента
const remove = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ message: 'Клиент не найден' });
    await client.destroy();
    res.json({ message: 'Клиент удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };
