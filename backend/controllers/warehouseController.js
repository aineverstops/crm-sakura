const { Product } = require('../models');
const { Op } = require('sequelize');

const getAll = async (req, res) => {
  try {
    const { search, lowStock } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (lowStock === 'true') {
      where.quantity = { [Op.lte]: Product.sequelize.col('minQuantity') };
    }
    const products = await Product.findAll({ where, order: [['name', 'ASC']] });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    const { delta } = req.body;
    const newQty = product.quantity + delta;
    if (newQty < 0) return res.status(400).json({ message: 'Недостаточно товара на складе' });
    await product.update({ quantity: newQty });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Товар не найден' });
    await product.destroy();
    res.json({ message: 'Товар удалён' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create, update, adjustStock, remove };
