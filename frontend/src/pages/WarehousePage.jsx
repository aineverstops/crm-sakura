import React, { useEffect, useState } from 'react';
import {
  Typography, Button, Modal, Form, Input, InputNumber, Select,
  Table, Tag, Space, Tooltip, message, Tabs, Card, Badge,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined,
  MinusCircleOutlined, FilePdfOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../services/api';
import { openInvoicePDF } from '../utils/pdfInvoice';

const { Title } = Typography;

const WarehousePage = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([{ productId: null, quantity: 1, price: 0 }]);
  const [form] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await api.get('/warehouse');
    setProducts(data);
    setLoading(false);
  };

  const fetchInvoices = () => api.get('/invoices').then((r) => setInvoices(r.data));

  useEffect(() => {
    fetchProducts();
    fetchInvoices();
    api.get('/clients').then((r) => setClients(r.data));
  }, []);

  const openModal = (product = null) => {
    setEditingProduct(product);
    form.setFieldsValue(product || { unit: 'шт', minQuantity: 5, price: 0, costPrice: 0, quantity: 0 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const vals = await form.validateFields();
    if (editingProduct) {
      await api.put(`/warehouse/${editingProduct.id}`, vals);
    } else {
      await api.post('/warehouse', vals);
    }
    setModalOpen(false);
    fetchProducts();
  };

  const handleStock = async (id, delta) => {
    try {
      await api.patch(`/warehouse/${id}/stock`, { delta });
      fetchProducts();
    } catch (err) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/warehouse/${id}`);
    fetchProducts();
  };

  const handleCreateInvoice = async () => {
    const vals = await invoiceForm.validateFields();
    const payload = {
      clientId: vals.clientId,
      type: vals.type,
      notes: vals.notes,
      items: invoiceItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    try {
      const { data } = await api.post('/invoices', payload);
      message.success('Накладная создана!');
      setInvoiceModalOpen(false);
      invoiceForm.resetFields();
      setInvoiceItems([{ productId: null, quantity: 1, price: 0 }]);
      fetchInvoices();
      fetchProducts();
      openInvoicePDF(data);
    } catch (err) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const productColumns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      render: (v, r) => (
        <span>
          <span style={{ fontWeight: 600 }}>{v}</span>
          {r.quantity <= r.minQuantity && (
            <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>Мало!</Tag>
          )}
        </span>
      ),
    },
    { title: 'Артикул', dataIndex: 'sku', key: 'sku', render: (v) => v || '—' },
    { title: 'Ед.', dataIndex: 'unit', key: 'unit' },
    { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity', render: (v, r) => <Badge count={v} color={v <= r.minQuantity ? 'orange' : '#FFB7C5'} showZero /> },
    { title: 'Цена', dataIndex: 'price', key: 'price', render: (v) => `${Number(v).toLocaleString('ru-RU')} ₸` },
    { title: 'Категория', dataIndex: 'category', key: 'category', render: (v) => v ? <Tag>{v}</Tag> : '—' },
    {
      title: 'Движение',
      key: 'stock',
      render: (_, r) => (
        <Space>
          <Tooltip title="Приход (+1)">
            <Button icon={<PlusCircleOutlined />} size="small" type="text" style={{ color: 'green' }} onClick={() => handleStock(r.id, 1)} />
          </Tooltip>
          <Tooltip title="Расход (-1)">
            <Button icon={<MinusCircleOutlined />} size="small" type="text" danger onClick={() => handleStock(r.id, -1)} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_, r) => (
        <Space>
          <Tooltip title="Редактировать товар"><Button icon={<EditOutlined />} size="small" type="text" onClick={() => openModal(r)} /></Tooltip>
          <Tooltip title="Удалить товар из каталога"><Button icon={<DeleteOutlined />} size="small" type="text" danger onClick={() => handleDelete(r.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  const invoiceColumns = [
    { title: '№', dataIndex: 'number', key: 'number', render: (v) => <strong>{v}</strong> },
    { title: 'Клиент', key: 'client', render: (_, r) => r.client?.name || '—' },
    { title: 'Тип', dataIndex: 'type', key: 'type', render: (v) => <Tag color={v === 'outgoing' ? 'red' : 'green'}>{v === 'outgoing' ? 'Расходная' : 'Приходная'}</Tag> },
    { title: 'Сумма', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `${Number(v).toLocaleString('ru-RU')} ₸` },
    { title: 'Статус', dataIndex: 'status', key: 'status', render: (v) => <Tag>{{ draft: 'Черновик', issued: 'Выставлена', paid: 'Оплачена', cancelled: 'Отменена' }[v]}</Tag> },
    {
      title: '',
      key: 'pdf',
      render: (_, r) => (
        <Tooltip title="Открыть PDF">
          <Button
            icon={<FilePdfOutlined />}
            size="small"
            type="text"
            style={{ color: '#ff8fab' }}
            onClick={() => api.get(`/invoices/${r.id}`).then((res) => openInvoicePDF(res.data))}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Склад</Title>

        <Tabs
          items={[
            {
              key: 'products',
              label: 'Товары',
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span />
                    <Space>
                      <Tooltip title="Открыть форму накладной — после создания автоматически списывает товар и открывает PDF">
                        <Button
                          id="tour-create-invoice"
                          icon={<FilePdfOutlined />}
                          onClick={() => setInvoiceModalOpen(true)}
                          style={{ borderRadius: 10, borderColor: '#FFB7C5', color: '#ff8fab' }}
                        >
                          Создать накладную
                        </Button>
                      </Tooltip>
                      <Tooltip title="Добавить новую позицию в каталог: название, артикул, цена, остаток">
                        <Button
                          id="tour-add-product"
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => openModal()}
                          style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
                        >
                          Добавить товар
                        </Button>
                      </Tooltip>
                    </Space>
                  </div>
                  <Table columns={productColumns} dataSource={products} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} style={{ borderRadius: 16, overflow: 'hidden' }} />
                </>
              ),
            },
            {
              key: 'invoices',
              label: 'Накладные',
              children: (
                <Table columns={invoiceColumns} dataSource={invoices} rowKey="id" pagination={{ pageSize: 10 }} style={{ borderRadius: 16, overflow: 'hidden' }} />
              ),
            },
          ]}
        />
      </motion.div>

      {/* Модалка товара */}
      <Modal
        open={modalOpen}
        title={editingProduct ? 'Редактировать товар' : 'Новый товар'}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
        width={560}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Наименование" rules={[{ required: true }]}><Input style={{ borderRadius: 8 }} /></Form.Item>
          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="sku" label="Артикул" style={{ flex: 1 }}><Input style={{ borderRadius: 8 }} /></Form.Item>
            <Form.Item name="barcode" label="Штрихкод" style={{ flex: 1 }}><Input style={{ borderRadius: 8 }} /></Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="unit" label="Единица" style={{ flex: 1 }}><Input style={{ borderRadius: 8 }} /></Form.Item>
            <Form.Item name="category" label="Категория" style={{ flex: 1 }}><Input style={{ borderRadius: 8 }} /></Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="price" label="Цена продажи" style={{ flex: 1 }}><InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} /></Form.Item>
            <Form.Item name="costPrice" label="Себестоимость" style={{ flex: 1 }}><InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} /></Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={12}>
            <Form.Item name="quantity" label="Остаток" style={{ flex: 1 }}><InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} /></Form.Item>
            <Form.Item name="minQuantity" label="Мин. остаток" style={{ flex: 1 }}><InputNumber style={{ width: '100%', borderRadius: 8 }} min={0} /></Form.Item>
          </Space>
          <Form.Item name="description" label="Описание"><Input.TextArea rows={2} style={{ borderRadius: 8 }} /></Form.Item>
        </Form>
      </Modal>

      {/* Модалка накладной */}
      <Modal
        open={invoiceModalOpen}
        title="Создать накладную"
        onOk={handleCreateInvoice}
        onCancel={() => setInvoiceModalOpen(false)}
        width={640}
        okText="Создать и открыть PDF"
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={invoiceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="clientId" label="Клиент" rules={[{ required: true }]}>
            <Select options={clients.map((c) => ({ value: c.id, label: c.name }))} placeholder="Выберите клиента" />
          </Form.Item>
          <Form.Item name="type" label="Тип накладной" initialValue="outgoing">
            <Select options={[{ value: 'outgoing', label: 'Расходная (продажа)' }, { value: 'incoming', label: 'Приходная (поступление)' }]} />
          </Form.Item>
          <Form.Item name="notes" label="Примечание"><Input.TextArea rows={2} style={{ borderRadius: 8 }} /></Form.Item>

          <Title level={5}>Позиции</Title>
          {invoiceItems.map((item, idx) => (
            <Card key={idx} style={{ marginBottom: 10, borderRadius: 12, border: '1px solid #ffe4ea' }} bodyStyle={{ padding: 14 }}>
              <Space style={{ width: '100%' }} size={8} wrap>
                <Select
                  style={{ width: 200 }}
                  placeholder="Товар"
                  value={item.productId}
                  onChange={(v) => {
                    const p = products.find((pr) => pr.id === v);
                    setInvoiceItems((prev) => prev.map((it, i) => i === idx ? { ...it, productId: v, price: p ? Number(p.price) : 0 } : it));
                  }}
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                />
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(v) => setInvoiceItems((prev) => prev.map((it, i) => i === idx ? { ...it, quantity: v } : it))}
                  placeholder="Кол-во"
                  style={{ width: 90 }}
                />
                <InputNumber
                  min={0}
                  value={item.price}
                  onChange={(v) => setInvoiceItems((prev) => prev.map((it, i) => i === idx ? { ...it, price: v } : it))}
                  placeholder="Цена"
                  style={{ width: 110 }}
                  formatter={(v) => `${v} ₸`}
                />
                <span style={{ fontWeight: 600 }}>= {((item.quantity || 0) * (item.price || 0)).toLocaleString('ru-RU')} ₸</span>
                {invoiceItems.length > 1 && (
                  <Button danger type="text" size="small" onClick={() => setInvoiceItems((prev) => prev.filter((_, i) => i !== idx))}>✕</Button>
                )}
              </Space>
            </Card>
          ))}
          <Button
            type="dashed"
            onClick={() => setInvoiceItems((prev) => [...prev, { productId: null, quantity: 1, price: 0 }])}
            style={{ width: '100%', borderColor: '#FFB7C5', color: '#ff8fab', borderRadius: 10, marginBottom: 8 }}
            icon={<PlusOutlined />}
          >
            Добавить позицию
          </Button>
          <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#ff8fab' }}>
            Итого: {invoiceItems.reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0).toLocaleString('ru-RU')} ₸
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehousePage;
