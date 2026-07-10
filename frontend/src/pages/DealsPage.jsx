// Страница «Сделки» — Kanban-доска. Сделки распределены по колонкам-статусам,
// карточку можно перетаскивать между колонками (drag-and-drop) для смены статуса.
import React, { useEffect, useState } from 'react';
import { Typography, Button, Modal, Form, Input, Select, InputNumber, Avatar, Tag, Space, message, Tooltip } from 'antd';
import { PlusOutlined, UserOutlined, DollarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const { Title, Text } = Typography;

// Колонки доски = статусы сделки (ключ, подпись, цвета)
const COLUMNS = [
  { key: 'new', label: 'Новая', color: '#e6f4ff', border: '#91caff' },
  { key: 'in_progress', label: 'В работе', color: '#fff7e6', border: '#ffd591' },
  { key: 'closed', label: 'Закрыта', color: '#f6ffed', border: '#b7eb8f' },
];

const DealsPage = () => {
  const [deals, setDeals] = useState([]);        // список всех сделок
  const [clients, setClients] = useState([]);    // список клиентов (для выпадающего списка)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null); // редактируемая сделка (или null = новая)
  const [dragging, setDragging] = useState(null);       // id перетаскиваемой сейчас сделки
  const [form] = Form.useForm();

  // Загрузка данных с сервера
  const fetchDeals = () => api.get('/deals').then((r) => setDeals(r.data));
  const fetchClients = () => api.get('/clients').then((r) => setClients(r.data));

  // При первом открытии страницы загружаем сделки и клиентов
  useEffect(() => {
    fetchDeals();
    fetchClients();
  }, []);

  // Открыть форму создания новой сделки
  const openCreate = () => {
    setEditingDeal(null);
    form.resetFields();
    form.setFieldsValue({ status: 'new' });
    setModalOpen(true);
  };

  // Открыть форму редактирования существующей сделки
  const openEdit = (deal) => {
    setEditingDeal(deal);
    form.setFieldsValue({
      title: deal.title,
      clientId: deal.clientId,
      amount: deal.amount,
      status: deal.status,
      description: deal.description || '',
    });
    setModalOpen(true);
  };

  // Сохранение сделки: если редактируем — PUT, если новая — POST
  const handleSave = async () => {
    const vals = await form.validateFields(); // проверка обязательных полей
    if (editingDeal) {
      await api.put(`/deals/${editingDeal.id}`, vals);
    } else {
      await api.post('/deals', vals);
    }
    setModalOpen(false);
    form.resetFields();
    fetchDeals(); // обновить доску
  };

  // Обработка ПЕРЕТАСКИВАНИЯ: сделку бросили в другую колонку → меняем её статус на сервере
  const handleDrop = async (dealId, newStatus) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === newStatus) return; // бросили в ту же колонку — ничего не делаем
    try {
      await api.put(`/deals/${dealId}`, { status: newStatus }); // обновляем статус
      fetchDeals();
    } catch {
      message.error('Не удалось обновить статус');
    }
  };

  // Удалить сделку
  const handleDelete = async (id) => {
    await api.delete(`/deals/${id}`);
    fetchDeals();
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Сделки (Kanban)</Title>
        <Tooltip title="Создать новую сделку с привязкой к клиенту, суммой и описанием" placement="left">
          <Button
            id="tour-add-deal"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
          >
            Новая сделка
          </Button>
        </Tooltip>
      </div>

      {/* Доска: три колонки по статусам */}
      <div id="tour-kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="kanban-col"
            style={{ background: col.color, border: `1px solid ${col.border}` }}
            onDragOver={(e) => e.preventDefault()}  // разрешаем бросать карточку сюда
            onDrop={(e) => {                          // карточку отпустили над этой колонкой
              e.preventDefault();
              if (dragging) handleDrop(dragging, col.key);
            }}
          >
            <Tooltip title="Перетащите карточку сделки сюда для смены статуса" placement="top">
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15, cursor: 'default' }}>
                {col.label}
                {/* Счётчик сделок в колонке */}
                <span style={{ marginLeft: 8, fontWeight: 400, color: '#888', fontSize: 13 }}>
                  ({deals.filter((d) => d.status === col.key).length})
                </span>
              </div>
            </Tooltip>

            {/* AnimatePresence — анимация появления/исчезновения карточек */}
            <AnimatePresence>
              {deals
                .filter((d) => d.status === col.key) // только сделки этой колонки
                .map((deal) => (
                  <motion.div
                    key={deal.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25 }}
                    className="kanban-card"
                    draggable                                   // карточку можно перетаскивать
                    onDragStart={() => setDragging(deal.id)}    // запомнили, что тащим
                    onDragEnd={() => setDragging(null)}         // отпустили
                    onClick={() => openEdit(deal)}              // клик — редактирование
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{deal.title}</div>
                    {/* Имя клиента сделки */}
                    {deal.client && (
                      <Space style={{ marginBottom: 8 }}>
                        <Avatar size={22} icon={<UserOutlined />} style={{ background: '#FFB7C5' }} />
                        <Text style={{ fontSize: 13 }}>{deal.client.name}</Text>
                      </Space>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Сумма сделки */}
                      <Text style={{ fontWeight: 700, color: '#ff8fab' }}>
                        <DollarOutlined /> {Number(deal.amount).toLocaleString('ru-RU')} ₸
                      </Text>
                      <Space size={4}>
                        <Tooltip title="Редактировать сделку">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={(e) => { e.stopPropagation(); openEdit(deal); }} // stopPropagation — чтобы не сработал onClick карточки
                            style={{ color: '#FFB7C5' }}
                          />
                        </Tooltip>
                        <Tooltip title="Удалить сделку">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Модальное окно создания/редактирования сделки */}
      <Modal
        open={modalOpen}
        title={editingDeal ? 'Редактировать сделку' : 'Новая сделка'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{
          style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 },
        }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          {/* Выбор клиента из списка */}
          <Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}>
            <Select
              style={{ borderRadius: 8 }}
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Выберите клиента"
            />
          </Form.Item>
          <Form.Item name="amount" label="Сумма (₸)">
            <InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} />
          </Form.Item>
          <Form.Item name="status" label="Статус" initialValue="new">
            <Select
              options={[
                { value: 'new', label: 'Новая' },
                { value: 'in_progress', label: 'В работе' },
                { value: 'closed', label: 'Закрыта' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DealsPage;
