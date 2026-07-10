const { Client, Deal, Task, Product, Invoice, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const getSummary = async (req, res) => {
  try {
    const [clientCount, dealCount, taskCount, productCount] = await Promise.all([
      Client.count(),
      Deal.count(),
      Task.count({ where: { status: 'todo' } }),
      Product.count(),
    ]);

    const revenue = await Deal.sum('amount', { where: { status: 'closed' } });

    const dealsByStatus = await Deal.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const monthlySales = await sequelize.query(`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        SUM(amount) AS total,
        COUNT(*) AS count
      FROM deals
      WHERE status = 'closed'
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month ASC
    `, { type: QueryTypes.SELECT });

    const lowStockProducts = await Product.findAll({
      where: sequelize.literal('"quantity" <= "minQuantity"'),
      attributes: ['id', 'name', 'quantity', 'minQuantity'],
    });

    res.json({
      clientCount,
      dealCount,
      taskCount,
      productCount,
      revenue: revenue || 0,
      dealsByStatus,
      monthlySales,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummary };
