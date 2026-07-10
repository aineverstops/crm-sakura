const { Task, Client, User } = require('../models');

const getAll = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { association: 'client', attributes: ['id', 'name'] },
        { association: 'assignee', attributes: ['id', 'fullName'] },
      ],
      order: [['deadline', 'ASC']],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });
    await task.update(req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Задача не найдена' });
    await task.destroy();
    res.json({ message: 'Задача удалена' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, create, update, remove };
