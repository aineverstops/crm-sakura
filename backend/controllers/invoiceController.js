// Контроллер накладных. Главная особенность — создание накладной через ТРАНЗАКЦИЮ:
// несколько операций (накладная + позиции + списание склада) выполняются как единое целое.
const { Invoice, InvoiceItem, Client, Product, sequelize } = require('../models');

// Получить список всех накладных (с именем клиента)
const getAll = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [{ association: 'client', attributes: ['id', 'name'] }], // подтянуть клиента
      order: [['createdAt', 'DESC']], // сначала новые
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить одну накладную по id — со всеми позициями и товарами
const getById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { association: 'client' },
        {
          association: 'items', // позиции накладной
          include: [{ association: 'product', attributes: ['id', 'name', 'unit'] }], // + товар в каждой
        },
      ],
    });
    if (!invoice) return res.status(404).json({ message: 'Накладная не найдена' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Создание накладной — самая важная операция, обёрнута в транзакцию
const create = async (req, res) => {
  // Открываем транзакцию: либо все шаги пройдут вместе, либо ни один (откат)
  const t = await sequelize.transaction();
  try {
    const { clientId, type, notes, items } = req.body;

    // Генерируем номер накладной по количеству уже существующих
    const count = await Invoice.count();
    const number = `НАК-${String(count + 1).padStart(5, '0')}`;

    // Итоговая сумма = сумма всех позиций (количество × цена)
    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // Шаг 1: создаём саму накладную (внутри транзакции t)
    const invoice = await Invoice.create(
      { number, clientId, type, notes, totalAmount },
      { transaction: t }
    );

    // Шаг 2: проходим по всем позициям накладной
    for (const item of items) {
      // Создаём позицию накладной
      await InvoiceItem.create(
        {
          invoiceId: invoice.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        },
        { transaction: t }
      );

      // Шаг 3: меняем остаток товара на складе
      if (type === 'outgoing') {
        // Расход — списываем товар со склада
        const product = await Product.findByPk(item.productId, { transaction: t });
        // Проверка: хватает ли товара. Если нет — выбрасываем ошибку → откат всей транзакции
        if (product.quantity < item.quantity) {
          throw new Error(`Недостаточно товара "${product.name}" на складе`);
        }
        await product.update({ quantity: product.quantity - item.quantity }, { transaction: t });
      } else {
        // Приход — добавляем товар на склад
        const product = await Product.findByPk(item.productId, { transaction: t });
        await product.update({ quantity: product.quantity + item.quantity }, { transaction: t });
      }
    }

    // Все шаги прошли успешно — фиксируем изменения в базе
    await t.commit();

    // Возвращаем созданную накладную со всеми связями
    const full = await Invoice.findByPk(invoice.id, {
      include: [
        { association: 'client' },
        {
          association: 'items',
          include: [{ association: 'product', attributes: ['id', 'name', 'unit'] }],
        },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    // Любая ошибка (например, нехватка товара) — откатываем ВСЁ, база остаётся как была
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAll, getById, create };
