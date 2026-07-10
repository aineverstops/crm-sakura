const { Deal, Client } = require('../models');

const getAll = async (req, res) => {
  try {
    const deals = await Deal.findAll({
      include: [{ association: 'client', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const deal = await Deal.create(req.body);
    const full = await Deal.findByPk(deal.id, {
      include: [{ association: 'client', attributes: ['id', 'name', 'avatar'] }],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Сделка не найдена' });
    if (req.body.status === 'closed') req.body.closedAt = new Date();
    await deal.update(req.body);
    const full = await Deal.findByPk(deal.id, {
      include: [{ association: 'client', attributes: ['id', 'name', 'avatar'] }],
    });
    res.json(full);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const deal = await Deal.findByPk(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Сделка не найдена' });
    await deal.destroy();
    res.json({ message: 'Сделка удалена' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, create, update, remove };
