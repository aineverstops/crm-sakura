import React, { useEffect, useState } from 'react';
import { Typography, Button, Modal, Form, Input, Select, DatePicker, Table, Tag, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;

const PRIORITY_COLOR = { low: 'default', medium: 'orange', high: 'red' };
const PRIORITY_LABEL = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
const STATUS_COLOR = { todo: 'default', in_progress: 'blue', done: 'green' };
const STATUS_LABEL = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' };

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await api.get('/tasks');
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    api.get('/clients').then((r) => setClients(r.data));
  }, []);

  const openModal = (task = null) => {
    setEditingTask(task);
    form.setFieldsValue(task ? {
      ...task,
      deadline: task.deadline ? dayjs(task.deadline) : null,
    } : { status: 'todo', priority: 'medium' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const vals = await form.validateFields();
    if (vals.deadline) vals.deadline = vals.deadline.toISOString();
    if (editingTask) {
      await api.put(`/tasks/${editingTask.id}`, vals);
    } else {
      await api.post('/tasks', vals);
    }
    setModalOpen(false);
    fetchTasks();
  };

  const handleDone = async (id) => {
    await api.put(`/tasks/${id}`, { status: 'done' });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const columns = [
    {
      title: 'Задача',
      dataIndex: 'title',
      key: 'title',
      render: (v, r) => (
        <span style={{ fontWeight: 600, textDecoration: r.status === 'done' ? 'line-through' : 'none', color: r.status === 'done' ? '#aaa' : '#1a1a1a' }}>
          {v}
        </span>
      ),
    },
    {
      title: 'Клиент',
      key: 'client',
      render: (_, r) => r.client?.name || '—',
    },
    {
      title: 'Дедлайн',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (v) => {
        if (!v) return '—';
        const d = dayjs(v);
        const overdue = d.isBefore(dayjs()) && true;
        return <span style={{ color: overdue ? '#ff4d4f' : '#1a1a1a' }}>{d.format('DD.MM.YYYY')}</span>;
      },
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (v) => <Tag color={PRIORITY_COLOR[v]}>{PRIORITY_LABEL[v]}</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>,
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      render: (_, r) => (
        <Space>
          {r.status !== 'done' && (
            <Tooltip title="Отметить выполненной">
              <Button icon={<CheckCircleOutlined />} size="small" type="text" style={{ color: 'green' }} onClick={() => handleDone(r.id)} />
            </Tooltip>
          )}
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
          <Title level={3} style={{ margin: 0 }}>Задачи</Title>
          <Tooltip title="Создать задачу с дедлайном, приоритетом и привязкой к клиенту" placement="left">
            <Button
              id="tour-add-task"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
            >
              Добавить задачу
            </Button>
          </Tooltip>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: 16, overflow: 'hidden' }}
        />
      </motion.div>

      <Modal
        open={modalOpen}
        title={editingTask ? 'Редактировать задачу' : 'Новая задача'}
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
          <Form.Item name="clientId" label="Клиент">
            <Select allowClear options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="Не выбран" />
          </Form.Item>
          <Form.Item name="deadline" label="Дедлайн">
            <DatePicker style={{ width: '100%', borderRadius: 8 }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="priority" label="Приоритет">
            <Select options={[{ value: 'low', label: 'Низкий' }, { value: 'medium', label: 'Средний' }, { value: 'high', label: 'Высокий' }]} />
          </Form.Item>
          <Form.Item name="status" label="Статус">
            <Select options={[{ value: 'todo', label: 'К выполнению' }, { value: 'in_progress', label: 'В работе' }, { value: 'done', label: 'Готово' }]} />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksPage;
