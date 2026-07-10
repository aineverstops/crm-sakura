// Страница «Клиенты» — таблица клиентов с поиском, добавлением, редактированием и сменой статуса.
import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Modal, Form, Space, Avatar, Tag, Typography, Tooltip, Select } from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

// Описание статусов клиента: подпись и цвет тега для каждого значения
const STATUS_META = {
  new:      { label: 'Новый',      color: 'blue' },     // синий
  active:   { label: 'Активен',    color: 'pink' },     // розовый
  inactive: { label: 'Неактивен',  color: 'default' },  // серый
  regular:  { label: 'Постоянный', style: { background: '#fffbe6', color: '#d4a017', border: '1px solid #ffe58f' } }, // мягкий жёлтый
};

// Отрисовка тега статуса в таблице (по значению из STATUS_META)
const renderStatus = (v) => {
  const s = STATUS_META[v] || STATUS_META.active; // если значение неизвестно — показываем «Активен»
  return s.style
    ? <Tag style={{ ...s.style, borderRadius: 6 }}>{s.label}</Tag> // кастомный стиль (для «Постоянный»)
    : <Tag color={s.color}>{s.label}</Tag>;                         // готовый цвет Ant Design
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);       // список клиентов
  const [loading, setLoading] = useState(false);    // индикатор загрузки таблицы
  const [search, setSearch] = useState('');         // строка поиска
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // редактируемый клиент (null = новый)
  const [form] = Form.useForm();
  const navigate = useNavigate(); // для перехода на страницу профиля клиента

  // Загрузка клиентов с сервера; q — поисковый запрос
  const fetchClients = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/clients', { params: { search: q } });
      setClients(data);
    } finally {
      setLoading(false); // в любом случае убираем индикатор загрузки
    }
  };

  // При открытии страницы загружаем всех клиентов
  useEffect(() => { fetchClients(); }, []);

  // Поиск в реальном времени: при вводе сразу запрашиваем сервер
  const handleSearch = (v) => { setSearch(v); fetchClients(v); };

  // Открыть форму. Если передан клиент — режим редактирования, иначе — новый клиент
  const openModal = (client = null) => {
    setEditingClient(client);
    // Заполняем форму данными клиента или значениями по умолчанию (новый клиент = активный)
    form.setFieldsValue(client || { name: '', email: '', phone: '', company: '', status: 'active' });
    setModalOpen(true);
  };

  // Сохранение: редактирование (PUT) или создание (POST)
  const handleSave = async () => {
    const vals = await form.validateFields(); // проверка обязательных полей (имя)
    if (editingClient) {
      await api.put(`/clients/${editingClient.id}`, vals);
    } else {
      await api.post('/clients', vals);
    }
    setModalOpen(false);
    fetchClients(search); // обновить таблицу с учётом текущего поиска
  };

  // Удаление клиента
  const handleDelete = async (id) => {
    await api.delete(`/clients/${id}`);
    fetchClients(search);
  };

  // Описание колонок таблицы Ant Design
  const columns = [
    {
      title: 'Клиент',
      key: 'name',
      render: (_, r) => (
        <Space>
          <Avatar src={r.avatar} icon={!r.avatar && <UserOutlined />} style={{ background: '#FFB7C5' }} />
          <Tooltip title="Открыть полный профиль клиента: история сделок, задачи, заметки">
            {/* Клик по имени — переход на страницу профиля клиента */}
            <span style={{ fontWeight: 600, cursor: 'pointer', color: '#ff8fab' }} onClick={() => navigate(`/clients/${r.id}`)}>
              {r.name}
            </span>
          </Tooltip>
        </Space>
      ),
    },
    { title: 'Компания', dataIndex: 'company', key: 'company', render: (v) => v || '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v || '—' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus, // отрисовка цветного тега статуса
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_, r) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button icon={<EditOutlined />} size="small" type="text" onClick={() => openModal(r)} />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button icon={<DeleteOutlined />} size="small" type="text" danger onClick={() => handleDelete(r.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Клиенты</Title>
          <Tooltip title="Открывает форму создания нового клиента: имя, компания, email, телефон, заметки" placement="left">
            <Button
              id="tour-add-client"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
            >
              Добавить клиента
            </Button>
          </Tooltip>
        </div>

        {/* Поле поиска (фильтрует таблицу в реальном времени) */}
        <Tooltip title="Поиск в реальном времени по имени, компании, email и телефону" placement="right">
          <Input id="tour-search"
            prefix={<SearchOutlined style={{ color: '#FFB7C5' }} />}
            placeholder="Поиск по имени, компании, email, телефону..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ marginBottom: 20, borderRadius: 10, maxWidth: 400 }}
            allowClear
          />
        </Tooltip>

        {/* Таблица клиентов */}
        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }} // по 10 строк на страницу
          onRow={(r) => ({
            // Клик средней кнопкой мыши — открыть профиль в новой вкладке
            onAuxClick: (e) => {
              if (e.button === 1) window.open(`/clients/${r.id}`, '_blank');
            },
          })}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        />
      </motion.div>

      {/* Модальное окно создания/редактирования клиента */}
      <Modal
        open={modalOpen}
        title={editingClient ? 'Редактировать клиента' : 'Новый клиент'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Имя" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="company" label="Компания">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          {/* Выпадающий список выбора статуса (значения берутся из STATUS_META) */}
          <Form.Item name="status" label="Статус">
            <Select
              style={{ borderRadius: 8 }}
              options={Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label }))}
            />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
