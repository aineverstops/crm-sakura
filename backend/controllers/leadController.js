// Контроллер лидов. Главная особенность — конвертация лида в клиента (переход по воронке).
const { Lead, Client } = require('../models');

// Получить все лиды
const getAll = async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [['createdAt', 'DESC']] });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Создать новый лид
const create = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Обновить лид (например, сменить статус: новый → связались → квалифицирован)
const update = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Лид не найден' });
    await lead.update(req.body);
    res.json(lead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Конвертация лида в клиента — ключевой переход воронки продаж
const convert = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Лид не найден' });

    // Создаём нового клиента на основе данных лида
    const client = await Client.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    });

    // Помечаем лид как «сконвертированный», чтобы он не обрабатывался повторно
    await lead.update({ status: 'converted' });
    res.json({ message: 'Лид конвертирован в клиента', client });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Удалить лид
const remove = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Лид не найден' });
    await lead.destroy();
    res.json({ message: 'Лид удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, create, update, convert, remove };
