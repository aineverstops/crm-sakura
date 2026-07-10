import React, { useEffect, useState } from 'react';
import { Typography, Button, Modal, Form, Input, Select, Table, Tag, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../services/api';

const { Title } = Typography;

const SOURCE_LABEL = { website: 'Сайт', instagram: 'Instagram', whatsapp: 'WhatsApp', telegram: 'Telegram', referral: 'Рекомендация', other: 'Другое' };
const SOURCE_COLOR = { website: 'blue', instagram: 'purple', whatsapp: 'green', telegram: 'cyan', referral: 'gold', other: 'default' };
const STATUS_LABEL = { new: 'Новый', contacted: 'Связались', qualified: 'Квалифицирован', converted: 'Конвертирован', lost: 'Потерян' };
const STATUS_COLOR = { new: 'blue', contacted: 'orange', qualified: 'purple', converted: 'green', lost: 'red' };

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form] = Form.useForm();

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await api.get('/leads');
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const openModal = (lead = null) => {
    setEditingLead(lead);
    form.setFieldsValue(lead || { source: 'other', status: 'new' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const vals = await form.validateFields();
    if (editingLead) {
      await api.put(`/leads/${editingLead.id}`, vals);
    } else {
      await api.post('/leads', vals);
    }
    setModalOpen(false);
    fetchLeads();
  };

  const handleConvert = async (id) => {
    try {
      await api.post(`/leads/${id}/convert`);
      message.success('Лид успешно конвертирован в клиента!');
      fetchLeads();
    } catch (err) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/leads/${id}`);
    fetchLeads();
  };

  const columns = [
    { title: 'Имя', dataIndex: 'name', key: 'name', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v) => v || '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v) => v || '—' },
    { title: 'Источник', dataIndex: 'source', key: 'source', render: (v) => <Tag color={SOURCE_COLOR[v]}>{SOURCE_LABEL[v]}</Tag> },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    {
      title: '',
      key: 'actions',
      width: 120,
      render: (_, r) => (
        <Space>
          {r.status !== 'converted' && (
            <Tooltip title="Конвертировать в клиента">
              <Button
                icon={<ThunderboltOutlined />}
                size="small"
                type="text"
                style={{ color: '#FFB7C5' }}
                onClick={() => handleConvert(r.id)}
              />
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
          <Title level={3} style={{ margin: 0 }}>Лиды</Title>
          <Tooltip title="Создать карточку потенциального клиента с источником (Instagram, WhatsApp и др.)" placement="left">
            <Button
              id="tour-add-lead"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
            >
              Добавить лид
            </Button>
          </Tooltip>
        </div>

        <Table columns={columns} dataSource={leads} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} style={{ borderRadius: 16, overflow: 'hidden' }} />
      </motion.div>

      <Modal
        open={modalOpen}
        title={editingLead ? 'Редактировать лид' : 'Новый лид'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Имя" rules={[{ required: true }]}><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="phone" label="Телефон"><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="email" label="Email"><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Form.Item name="source" label="Источник">
            <Select options={Object.entries(SOURCE_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="status" label="Статус">
            <Select options={Object.entries(STATUS_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="notes" label="Заметки"><Input.TextArea rows={3} style={{ borderRadius: 8 }} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeadsPage;
