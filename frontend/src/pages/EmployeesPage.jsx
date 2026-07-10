import React, { useState, useRef } from 'react';
import { Typography, Card, Avatar, Tag, Button, Modal, Form, Input, Select, message, Row, Col, Divider, Tooltip } from 'antd';
import { UserOutlined, PlusOutlined, CrownOutlined, EditOutlined, CameraOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const STORAGE_KEY = 'crm_employees';

const DEFAULT_USERS = [
  { id: 1, fullName: 'Батталов Тимур', username: 'timur', role: 'admin', email: 'timur@crm.kz', phone: '+7 700 000 0001', avatar: null },
  { id: 2, fullName: 'Алия Жаксыбекова', username: 'aliya', role: 'manager', email: 'aliya@crm.kz', phone: '', avatar: null },
  { id: 3, fullName: 'Серик Нурланов', username: 'serik', role: 'manager', email: 'serik@crm.kz', phone: '', avatar: null },
];

const loadUsers = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
};

const saveUsers = (users) => localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

const EmployeesPage = () => {
  const [users, setUsers] = useState(loadUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const avatarInputRef = useRef(null);

  const updateUsers = (updated) => {
    setUsers(updated);
    saveUsers(updated);
  };

  // Открыть редактирование
  const openEdit = (user) => {
    setEditingUser({ ...user });
    form.setFieldsValue({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
  };

  // Сохранить изменения
  const handleSaveEdit = async () => {
    const vals = await form.validateFields();
    const updated = users.map((u) =>
      u.id === editingUser.id ? { ...u, ...vals, avatar: editingUser.avatar } : u
    );
    updateUsers(updated);
    message.success('Данные сотрудника обновлены');
    setEditingUser(null);
  };

  // Загрузка аватара через input[file]
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      message.error('Файл слишком большой. Максимум 3 МБ.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingUser((prev) => ({ ...prev, avatar: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Удалить аватар
  const handleRemoveAvatar = () => setEditingUser((prev) => ({ ...prev, avatar: null }));

  // Добавить сотрудника
  const handleAdd = async () => {
    const vals = await addForm.validateFields();
    const newUser = {
      id: Date.now(),
      ...vals,
      avatar: null,
      phone: vals.phone || '',
    };
    const updated = [...users, newUser];
    updateUsers(updated);
    message.success('Сотрудник добавлен');
    setAddModalOpen(false);
    addForm.resetFields();
  };

  // Удалить сотрудника
  const handleDelete = (id) => {
    const updated = users.filter((u) => u.id !== id);
    updateUsers(updated);
    message.success('Сотрудник удалён');
    setEditingUser(null);
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Сотрудники</Title>
          <Tooltip title="Создать новую учётную запись: ФИО, логин, пароль и роль (Администратор / Менеджер)" placement="left">
            <Button
              id="tour-add-employee"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddModalOpen(true)}
              style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
            >
              Добавить сотрудника
            </Button>
          </Tooltip>
        </div>

        <Row id="tour-employees-grid" gutter={[20, 20]}>
          {users.map((user, i) => (
            <Col xs={24} sm={12} lg={8} key={user.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Tooltip title="Нажмите, чтобы редактировать данные сотрудника: имя, контакты, роль и фото" placement="top">
                <Card
                  className="sakura-card"
                  bodyStyle={{ padding: 28 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openEdit(user)}
                  hoverable
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        size={64}
                        src={user.avatar}
                        icon={!user.avatar && <UserOutlined />}
                        style={{
                          background: user.avatar
                            ? 'transparent'
                            : user.role === 'admin'
                            ? 'linear-gradient(135deg, #FFB7C5, #ff8fab)'
                            : 'linear-gradient(135deg, #ffd6e0, #ffaec9)',
                          fontSize: 28,
                        }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#fff', border: '1.5px solid #ffe4ea',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <EditOutlined style={{ fontSize: 10, color: '#FFB7C5' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{user.fullName}</div>
                      <Text style={{ color: '#888', fontSize: 13 }}>@{user.username}</Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          icon={user.role === 'admin' ? <CrownOutlined /> : null}
                          color={user.role === 'admin' ? 'pink' : 'default'}
                        >
                          {user.role === 'admin' ? 'Администратор' : 'Менеджер'}
                        </Tag>
                      </div>
                    </div>
                  </div>
                  {user.email && (
                    <div style={{ marginTop: 14, fontSize: 13, color: '#888' }}>{user.email}</div>
                  )}
                  {user.phone && (
                    <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>{user.phone}</div>
                  )}
                </Card>
                </Tooltip>
              </motion.div>
            </Col>
          ))}
        </Row>
      </motion.div>

      {/* Модалка редактирования */}
      <Modal
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        footer={null}
        centered
        width={460}
        styles={{ content: { borderRadius: 24, padding: 0, overflow: 'hidden' } }}
      >
        {editingUser && (
          <>
            {/* Шапка с аватаром */}
            <div style={{
              background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
              padding: '32px 24px 24px',
              textAlign: 'center',
            }}>
              {/* Скрытый input для загрузки фото */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />

              {/* Аватар — кликабельный */}
              <Tooltip title="Нажмите, чтобы поменять фото">
                <div
                  style={{ display: 'inline-block', position: 'relative', cursor: 'pointer', marginBottom: 12 }}
                  onClick={() => avatarInputRef.current.click()}
                >
                  <Avatar
                    size={90}
                    src={editingUser.avatar}
                    icon={!editingUser.avatar && <UserOutlined />}
                    style={{
                      background: 'rgba(255,255,255,0.3)',
                      fontSize: 40,
                      border: '3px solid rgba(255,255,255,0.6)',
                    }}
                  />
                  {/* Оверлей с иконкой камеры */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <CameraOutlined style={{ color: '#fff', fontSize: 24 }} />
                  </div>
                </div>
              </Tooltip>

              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{editingUser.fullName}</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }}>
                {editingUser.role === 'admin' ? 'Администратор' : 'Менеджер'}
              </div>

              {editingUser.avatar && (
                <Button
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleRemoveAvatar(); }}
                  style={{
                    marginTop: 10, borderRadius: 8,
                    background: 'rgba(255,255,255,0.2)', border: 'none',
                    color: '#fff', fontSize: 12,
                  }}
                >
                  Удалить фото
                </Button>
              )}
            </div>

            {/* Форма */}
            <div style={{ padding: '24px 28px' }}>
              <Form form={form} layout="vertical">
                <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="username" label="Логин" rules={[{ required: true }]}>
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="phone" label="Телефон">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="role" label="Роль">
                  <Select options={[
                    { value: 'admin', label: 'Администратор' },
                    { value: 'manager', label: 'Менеджер' },
                  ]} />
                </Form.Item>
              </Form>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1, height: 42,
                    background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
                    border: 'none', borderRadius: 10,
                    color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  style={{
                    flex: 1, height: 42,
                    background: '#f5f5f5', border: 'none', borderRadius: 10,
                    fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Отмена
                </button>
              </div>

              <Divider style={{ borderColor: '#ffe4ea', margin: '16px 0 12px' }} />

              <button
                onClick={() => handleDelete(editingUser.id)}
                style={{
                  width: '100%', height: 38,
                  background: 'none', border: '1px solid #ffccc7',
                  borderRadius: 10, color: '#ff4d4f',
                  fontWeight: 600, cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <DeleteOutlined /> Удалить сотрудника
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Модалка добавления */}
      <Modal
        open={addModalOpen}
        title="Добавить сотрудника"
        onOk={handleAdd}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="fullName" label="ФИО" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="username" label="Логин" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
            <Input.Password style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="role" label="Роль" initialValue="manager">
            <Select options={[
              { value: 'admin', label: 'Администратор' },
              { value: 'manager', label: 'Менеджер' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
