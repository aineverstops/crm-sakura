// ТРЕНИРОВОЧНЫЙ РЕЖИМ: изолированное хранилище в localStorage, реальная база НЕ затрагивается.
// Страницы используют `api` как обычно — при включении режима подменяется только адаптер axios,
// и все запросы обрабатываются здесь, локально, вместо отправки на сервер.

const PFX = 'training_'; // префикс ключей в localStorage — изолирует тренировочные данные

// Мини-хранилище поверх localStorage: get / set / list (с запасным значением)
const store = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(PFX + key)); } catch { return null; }
  },
  set: (key, val) => localStorage.setItem(PFX + key, JSON.stringify(val)),
  list: (key, fallback) => {
    const v = store.get(key);
    return v !== null ? v : fallback;
  },
};

// SEED — стартовый набор тестовых данных (заполняется при первом включении режима)
const SEED = {
  clients: [
    { id: 9001, name: 'Тестовый клиент Аяна', company: 'ТОО «Тест»', email: 'ayana@test.kz', phone: '+7 701 000 0001', status: 'active', notes: 'Тренировочный клиент' },
    { id: 9002, name: 'Тестовый клиент Берик', company: 'ИП Тестов', email: 'berik@test.kz', phone: '+7 701 000 0002', status: 'active', notes: '' },
    { id: 9003, name: 'Тестовый клиент Гульнар', company: '', email: '', phone: '+7 701 000 0003', status: 'inactive', notes: '' },
  ],
  deals: [
    { id: 9101, title: 'Тренировочная сделка 1', clientId: 9001, amount: 150000, status: 'new', description: '' },
    { id: 9102, title: 'Тренировочная сделка 2', clientId: 9002, amount: 320000, status: 'in_progress', description: '' },
    { id: 9103, title: 'Тренировочная сделка 3', clientId: 9001, amount: 85000, status: 'closed', description: '' },
  ],
  tasks: [
    { id: 9201, title: 'Позвонить тестовому клиенту', clientId: 9001, deadline: null, priority: 'medium', status: 'todo', description: '' },
    { id: 9202, title: 'Подготовить коммерческое предложение', clientId: 9002, deadline: null, priority: 'high', status: 'in_progress', description: '' },
  ],
  leads: [
    { id: 9301, name: 'Тестовый лид Данияр', phone: '+7 707 123 4567', email: '', source: 'instagram', status: 'new', notes: '' },
    { id: 9302, name: 'Тестовый лид Эльмира', phone: '', email: 'elmira@test.kz', source: 'website', status: 'contacted', notes: '' },
  ],
  warehouse: [
    { id: 9401, name: 'Тестовый товар А', sku: 'TST-001', barcode: '', unit: 'шт', price: 5000, costPrice: 3000, quantity: 20, minQuantity: 5, category: 'Тест', description: '' },
    { id: 9402, name: 'Тестовый товар Б', sku: 'TST-002', barcode: '', unit: 'кг', price: 1200, costPrice: 800, quantity: 3, minQuantity: 5, category: 'Тест', description: '' },
    { id: 9403, name: 'Тестовый товар В', sku: 'TST-003', barcode: '', unit: 'шт', price: 25000, costPrice: 18000, quantity: 10, minQuantity: 3, category: 'Тест', description: '' },
  ],
  invoices: [],
};

const initSeed = () => {
  if (store.get('_seeded') === true) return;
  Object.entries(SEED).forEach(([k, v]) => store.set(k, v));
  store.set('_seeded', true);
};

const ok = (data) => Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config: {}, request: {} });
const fail = (msg) => Promise.reject({ response: { status: 400, data: { message: msg } } });

const nextId = () => Date.now() + Math.floor(Math.random() * 1000);

const withClient = (item, clients) => {
  if (!item || !item.clientId) return item;
  return { ...item, client: clients.find((c) => c.id === item.clientId) || null };
};

const parseBody = (config) => {
  if (!config.data) return {};
  try { return typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch { return {}; }
};

// ГЛАВНАЯ ФУНКЦИЯ-ПЕРЕХВАТЧИК: получает запрос axios и сама возвращает «ответ»,
// эмулируя поведение бэкенда. Разбирает URL и метод, и для каждого ресурса имитирует CRUD.
const trainingAdapter = (config) => {
  const method = (config.method || 'get').toLowerCase();        // get / post / put / delete
  const rawUrl = (config.url || '').replace(/^\/api/, '').split('?')[0];
  const parts = rawUrl.split('/').filter(Boolean);             // напр. ['clients', '5']
  const resource = parts[0];                                   // ресурс: clients / deals / leads...
  const id = parts[1] ? (isNaN(parts[1]) ? parts[1] : Number(parts[1])) : null;
  const sub = parts[2] || null; // e.g. 'stock', 'convert'
  const params = config.params || {};
  const body = parseBody(config);

  // AUTH
  if (resource === 'auth') return ok({ id: 0, fullName: 'Тренировочный режим', role: 'admin', username: 'training' });

  // CLIENTS
  if (resource === 'clients') {
    let list = store.list('clients', SEED.clients);
    if (method === 'get' && !id) {
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.company || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
        );
      }
      return ok(list);
    }
    if (method === 'get' && id) {
      const c = list.find((c) => c.id === id);
      return c ? ok(c) : ok(null);
    }
    if (method === 'post') {
      const item = { id: nextId(), status: 'active', avatar: null, ...body };
      store.set('clients', [...list, item]);
      return ok(item);
    }
    if (method === 'put' && id) {
      const updated = list.map((c) => c.id === id ? { ...c, ...body } : c);
      store.set('clients', updated);
      return ok(updated.find((c) => c.id === id) || {});
    }
    if (method === 'delete' && id) {
      store.set('clients', list.filter((c) => c.id !== id));
      return ok({});
    }
  }

  // DEALS
  if (resource === 'deals') {
    const clients = store.list('clients', SEED.clients);
    let list = store.list('deals', SEED.deals);
    if (method === 'get' && !id) return ok(list.map((d) => withClient(d, clients)));
    if (method === 'post') {
      const item = { id: nextId(), status: 'new', ...body };
      store.set('deals', [...list, item]);
      return ok(withClient(item, clients));
    }
    if (method === 'put' && id) {
      const updated = list.map((d) => d.id === id ? { ...d, ...body } : d);
      store.set('deals', updated);
      return ok(withClient(updated.find((d) => d.id === id) || {}, clients));
    }
    if (method === 'delete' && id) {
      store.set('deals', list.filter((d) => d.id !== id));
      return ok({});
    }
  }

  // TASKS
  if (resource === 'tasks') {
    const clients = store.list('clients', SEED.clients);
    let list = store.list('tasks', SEED.tasks);
    if (method === 'get' && !id) return ok(list.map((t) => withClient(t, clients)));
    if (method === 'post') {
      const item = { id: nextId(), status: 'todo', priority: 'medium', ...body };
      store.set('tasks', [...list, item]);
      return ok(withClient(item, clients));
    }
    if (method === 'put' && id) {
      const updated = list.map((t) => t.id === id ? { ...t, ...body } : t);
      store.set('tasks', updated);
      return ok(withClient(updated.find((t) => t.id === id) || {}, clients));
    }
    if (method === 'delete' && id) {
      store.set('tasks', list.filter((t) => t.id !== id));
      return ok({});
    }
  }

  // LEADS
  if (resource === 'leads') {
    let list = store.list('leads', SEED.leads);
    if (method === 'get' && !id) return ok(list);
    if (method === 'post' && !id) {
      const item = { id: nextId(), status: 'new', source: 'other', ...body };
      store.set('leads', [...list, item]);
      return ok(item);
    }
    if (method === 'put' && id) {
      const updated = list.map((l) => l.id === id ? { ...l, ...body } : l);
      store.set('leads', updated);
      return ok(updated.find((l) => l.id === id) || {});
    }
    if (method === 'delete' && id) {
      store.set('leads', list.filter((l) => l.id !== id));
      return ok({});
    }
    // POST /leads/:id/convert
    if (method === 'post' && id && sub === 'convert') {
      const lead = list.find((l) => l.id === id);
      if (!lead) return fail('Лид не найден');
      const clients = store.list('clients', SEED.clients);
      const newClient = { id: nextId(), name: lead.name, phone: lead.phone || '', email: lead.email || '', company: '', status: 'active', avatar: null, notes: '' };
      store.set('clients', [...clients, newClient]);
      store.set('leads', list.map((l) => l.id === id ? { ...l, status: 'converted' } : l));
      return ok(newClient);
    }
  }

  // WAREHOUSE
  if (resource === 'warehouse') {
    let list = store.list('warehouse', SEED.warehouse);
    if (method === 'get' && !id) return ok(list);
    if (method === 'get' && id) return ok(list.find((p) => p.id === id) || null);
    if (method === 'post' && !id) {
      const item = { id: nextId(), quantity: 0, minQuantity: 5, ...body };
      store.set('warehouse', [...list, item]);
      return ok(item);
    }
    if (method === 'put' && id) {
      const updated = list.map((p) => p.id === id ? { ...p, ...body } : p);
      store.set('warehouse', updated);
      return ok(updated.find((p) => p.id === id) || {});
    }
    if (method === 'delete' && id) {
      store.set('warehouse', list.filter((p) => p.id !== id));
      return ok({});
    }
    // PATCH /warehouse/:id/stock
    if (method === 'patch' && id && sub === 'stock') {
      const delta = body.delta || 0;
      const product = list.find((p) => p.id === id);
      if (!product) return fail('Товар не найден');
      const newQty = (product.quantity || 0) + delta;
      if (newQty < 0) return fail('Недостаточно товара на складе');
      const updated = list.map((p) => p.id === id ? { ...p, quantity: newQty } : p);
      store.set('warehouse', updated);
      return ok(updated.find((p) => p.id === id));
    }
  }

  // INVOICES
  if (resource === 'invoices') {
    const clients = store.list('clients', SEED.clients);
    let list = store.list('invoices', []);
    if (method === 'get' && !id) {
      return ok(list.map((inv) => ({ ...inv, client: clients.find((c) => c.id === inv.clientId) || null })));
    }
    if (method === 'get' && id) {
      const inv = list.find((i) => i.id === id);
      if (!inv) return fail('Накладная не найдена');
      return ok({ ...inv, client: clients.find((c) => c.id === inv.clientId) || null });
    }
    if (method === 'post') {
      let products = store.list('warehouse', SEED.warehouse);
      if (body.type === 'outgoing') {
        for (const item of (body.items || [])) {
          const p = products.find((pr) => pr.id === item.productId);
          if (p && p.quantity < item.quantity) return fail(`Недостаточно товара "${p.name}" на складе`);
        }
        products = products.map((p) => {
          const item = (body.items || []).find((i) => i.productId === p.id);
          return item ? { ...p, quantity: p.quantity - item.quantity } : p;
        });
        store.set('warehouse', products);
      }
      const totalAmount = (body.items || []).reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);
      const inv = {
        id: nextId(),
        number: `ТР-${String(Date.now()).slice(-6)}`,
        clientId: body.clientId,
        type: body.type || 'outgoing',
        notes: body.notes || '',
        status: 'issued',
        totalAmount,
        items: (body.items || []).map((item) => ({
          ...item,
          product: products.find((p) => p.id === item.productId) || null,
        })),
        createdAt: new Date().toISOString(),
      };
      store.set('invoices', [...list, inv]);
      return ok({ ...inv, client: clients.find((c) => c.id === body.clientId) || null });
    }
  }

  // ANALYTICS
  if (resource === 'analytics') {
    const clients = store.list('clients', SEED.clients);
    const deals = store.list('deals', SEED.deals);
    const tasks = store.list('tasks', SEED.tasks);
    const products = store.list('warehouse', SEED.warehouse);
    const closed = deals.filter((d) => d.status === 'closed');
    const revenue = closed.reduce((s, d) => s + Number(d.amount || 0), 0);
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: d.toLocaleString('ru-RU', { month: 'short', year: '2-digit' }),
        total: i === 5 ? revenue : 0,
        count: i === 5 ? closed.length : 0,
      };
    });
    return ok({
      clientCount: clients.length,
      dealCount: deals.length,
      taskCount: tasks.filter((t) => t.status !== 'done').length,
      productCount: products.length,
      revenue,
      dealsByStatus: ['new', 'in_progress', 'closed'].map((status) => ({
        status,
        count: deals.filter((d) => d.status === status).length,
      })),
      monthlySales: months,
      lowStockProducts: products.filter((p) => p.quantity <= p.minQuantity),
    });
  }

  // Fallback for any unknown routes
  return ok([]);
};

let _original = null; // сюда сохраняем «настоящий» адаптер, чтобы потом вернуть

// ВКЛЮЧИТЬ режим: заполнить тестовые данные и подменить транспорт axios на наш эмулятор
export const enableTraining = (axiosInstance) => {
  initSeed();                                       // создать SEED-данные при первом запуске
  _original = axiosInstance.defaults.adapter;       // запомнить оригинальный адаптер
  axiosInstance.defaults.adapter = trainingAdapter; // подменить — теперь запросы идут к нам
};

// ВЫКЛЮЧИТЬ режим: вернуть оригинальный адаптер (запросы снова идут на реальный сервер)
export const disableTraining = (axiosInstance) => {
  if (_original !== null) {
    axiosInstance.defaults.adapter = _original;
    _original = null;
  }
};

// СБРОСИТЬ тренировочные данные: удалить все ключи с префиксом training_ и пересоздать SEED
export const resetTrainingData = () => {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PFX))
    .forEach((k) => localStorage.removeItem(k));
  initSeed();
};
