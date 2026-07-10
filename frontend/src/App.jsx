import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Avatar, Badge, Dropdown, Space, Typography, Modal, Form, Input, Divider, message, Tooltip } from 'antd';
import {
  DashboardOutlined, TeamOutlined, DollarOutlined, CheckSquareOutlined,
  FunnelPlotOutlined, BarChartOutlined, CalendarOutlined, SettingOutlined,
  InboxOutlined, UserOutlined, LogoutOutlined, BellOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, ReadOutlined, MessageOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setUser, clearFirstLogin } from './store/authSlice';
import { markAllRead } from './store/notificationsSlice';
import api from './services/api';
import { enableTraining, disableTraining, resetTrainingData } from './services/trainingAdapter';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientProfilePage from './pages/ClientProfilePage';
import DealsPage from './pages/DealsPage';
import TasksPage from './pages/TasksPage';
import LeadsPage from './pages/LeadsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import WarehousePage from './pages/WarehousePage';
import EmployeesPage from './pages/EmployeesPage';
import SettingsPage from './pages/SettingsPage';
import ChatsPage from './pages/ChatsPage';
import SpotlightTour from './components/SpotlightTour';
import SakuraTransition from './components/SakuraTransition';
import NotificationPopup from './components/NotificationPopup';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

// Тема Sakura
const sakuraTheme = {
  token: {
    colorPrimary: '#FFB7C5',
    colorPrimaryHover: '#ff8fab',
    colorPrimaryActive: '#ff6b8a',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#fafafa',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    colorText: '#1a1a1a',
    colorTextSecondary: '#888888',
    colorBorder: '#ffe4ea',
    colorBorderSecondary: '#fff0f4',
    colorFillAlter: '#fff5f7',
    colorFillContent: '#fff5f7',
    boxShadow: '0 2px 12px rgba(255,183,197,0.12)',
    boxShadowSecondary: '0 6px 24px rgba(255,183,197,0.2)',
  },
  components: {
    Menu: {
      colorItemBg: 'transparent',
      colorItemText: '#555',
      colorItemTextSelected: '#ff8fab',
      colorItemBgSelected: '#fff5f7',
      colorItemTextHover: '#ff8fab',
      colorItemBgHover: '#fff0f4',
      itemBorderRadius: 12,
    },
    Table: {
      headerBg: '#fff5f7',
      headerColor: '#1a1a1a',
      rowHoverBg: '#fff5f7',
    },
    Button: {
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 20,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
  },
};

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/clients', icon: <TeamOutlined />, label: 'Клиенты' },
  { key: '/deals', icon: <DollarOutlined />, label: 'Сделки' },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: 'Задачи' },
  { key: '/leads', icon: <FunnelPlotOutlined />, label: 'Лиды' },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналитика' },
  { key: '/calendar', icon: <CalendarOutlined />, label: 'Календарь' },
  { key: '/warehouse', icon: <InboxOutlined />, label: 'Склад' },
  { key: '/employees', icon: <UserOutlined />, label: 'Сотрудники' },
  { key: '/chats', icon: <MessageOutlined />, label: 'Чаты' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Настройки' },
];

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isFirstLogin } = useSelector((s) => s.auth);
  const { unreadCount, items: notifs } = useSelector((s) => s.notifications);
  const [collapsed, setCollapsed] = useState(false);
  const [showTourPrompt, setShowTourPrompt] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [trainingMode, setTrainingMode] = useState(false);
  const [showSakuraTransition, setShowSakuraTransition] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm] = Form.useForm();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!user) {
      api.get('/auth/me').then((r) => dispatch(setUser(r.data))).catch(() => dispatch(logout()));
    }
  }, [token, user, navigate, dispatch]);

  // Включаем/выключаем тренировочный адаптер при смене режима
  useEffect(() => {
    if (trainingMode) {
      enableTraining(api);
    } else {
      disableTraining(api);
    }
    return () => disableTraining(api);
  }, [trainingMode]);

  // Показываем промпт если тур ещё не пройден и не был отклонён в этой сессии
  useEffect(() => {
    if (
      token &&
      localStorage.getItem('crm_tour_done') !== 'true' &&
      sessionStorage.getItem('crm_tour_declined') !== '1'
    ) {
      const t = setTimeout(() => setShowTourPrompt(true), 800);
      return () => clearTimeout(t);
    }
  }, [token]);

  if (!token) return null;

  const notifMenu = {
    items: notifs.slice(0, 6).map((n, i) => ({
      key: i,
      label: (
        <div style={{ maxWidth: 260 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{n.from}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{n.text}</div>
        </div>
      ),
    })).concat([{ key: 'clear', label: <span style={{ color: '#FFB7C5' }}>Отметить всё прочитанным</span> }]),
    onClick: ({ key }) => { if (key === 'clear') dispatch(markAllRead()); },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* Фон Фудзи — размытый, за всем контентом */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/fuji.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(14px) brightness(0.92)',
        transform: 'scale(1.05)',
        zIndex: 0,
      }} />
      {/* Белый полупрозрачный слой чтобы интерфейс читался */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,0.78)',
        zIndex: 0,
      }} />

      {/* Промпт перед туром */}
      {showTourPrompt && !showTour && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9990, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: '44px 44px 36px',
            width: 460, textAlign: 'center',
            boxShadow: '0 24px 72px rgba(0,0,0,0.22)', border: '1px solid #ffe4ea',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✦</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 10 }}>
              Добро пожаловать в CRM Sakura!
            </div>
            <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: 32 }}>
              Хотите, чтобы система провела вас по всем разделам<br />и объяснила назначение каждой кнопки?<br />
              <span style={{ fontSize: 12, color: '#aaa' }}>Это займёт около 5 минут</span>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => { setShowTourPrompt(false); setShowTour(true); }}
                style={{
                  background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none',
                  borderRadius: 12, padding: '12px 28px', cursor: 'pointer',
                  color: '#fff', fontWeight: 700, fontSize: 15,
                  boxShadow: '0 6px 18px rgba(255,139,171,0.4)',
                }}
              >
                Да, начать обучение!
              </button>
              <button
                onClick={() => { sessionStorage.setItem('crm_tour_declined', '1'); setShowTourPrompt(false); }}
                style={{
                  background: '#f5f5f5', border: 'none', borderRadius: 12,
                  padding: '12px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#666',
                }}
              >
                Нет, спасибо
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Спотлайт-тур */}
      {showTour && (
        <SpotlightTour
          onFinish={(completed) => {
            setShowTour(false);
            if (completed) localStorage.setItem('crm_tour_done', 'true');
            else sessionStorage.setItem('crm_tour_declined', '1');
          }}
        />
      )}

      {/* Анимация перехода в режим тренировки */}
      {showSakuraTransition && (
        <SakuraTransition
          onComplete={() => {
            setShowSakuraTransition(false);
            setTrainingMode(true);
          }}
        />
      )}

      {/* Банер режима тренировки */}
      {trainingMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 44, zIndex: 200,
          background: 'linear-gradient(135deg, #FFB7C5 0%, #ff8fab 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          boxShadow: '0 2px 16px rgba(255,139,171,0.45)',
        }}>
          <span style={{ color: '#7d2a45', fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>
            РЕЖИМ ТРЕНИРОВКИ — все функции доступны, изменения не влияют на основную работу
          </span>
          <button
            onClick={() => { resetTrainingData(); window.location.reload(); }}
            style={{
              background: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 8, padding: '4px 14px', cursor: 'pointer',
              color: '#7d2a45', fontWeight: 600, fontSize: 13,
            }}
          >
            Сбросить данные
          </button>
          <button
            onClick={() => setTrainingMode(false)}
            style={{
              background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: 8, padding: '4px 14px', cursor: 'pointer',
              color: '#7d2a45', fontWeight: 600, fontSize: 13,
            }}
          >
            ← Вернуться в рабочую CRM
          </button>
        </div>
      )}

      <NotificationPopup />

      <Sider
        collapsed={collapsed}
        width={230}
        collapsedWidth={72}
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid #ffe4ea',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          transition: 'width 0.25s ease',
        }}
      >
        {/* Логотип */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid #ffe4ea',
          gap: 10,
        }}>
          <span style={{ fontSize: 22, color: '#FFB7C5', fontWeight: 900 }}>✦</span>
          {!collapsed && (
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a', letterSpacing: 0.5 }}>
              CRM<span style={{ color: '#FFB7C5' }}>Sakura</span>
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split('/').slice(0, 2).join('/')]}
          style={{ border: 'none', padding: '12px 8px', flex: 1 }}
          items={NAV_ITEMS.map((item) => ({
            ...item,
            icon: <span id={`menu-${item.key.slice(1)}`}>{item.icon}</span>,
            label: item.label,
            onClick: () => navigate(item.key),
          }))}
        />

        {/* Пользователь */}
        {!collapsed && user && (
          <div style={{
            padding: '16px 16px',
            borderTop: '1px solid #ffe4ea',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Avatar size={34} icon={<UserOutlined />} style={{ background: '#FFB7C5', flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName}
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>{user.role === 'admin' ? 'Администратор' : 'Менеджер'}</div>
            </div>
          </div>
        )}
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 72 : 230, transition: 'margin-left 0.25s ease', marginTop: trainingMode ? 44 : 0 }}>
        <Header style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #ffe4ea',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: trainingMode ? 0 : 0,
          zIndex: 99,
          height: 60,
        }}>
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#FFB7C5', padding: 4 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>

          <Space size={16}>
            {/* Кнопка запуска тура */}
            <Tooltip title="Запустить обучение по CRM">
              <button
                onClick={() => setShowTour(true)}
                style={{ background: 'none', border: '1px solid #ffe4ea', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#ff8fab', padding: '4px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <ReadOutlined /> Обучение
              </button>
            </Tooltip>

            {/* Кнопка режима тренировки */}
            <Tooltip title={trainingMode ? 'Выйти из режима тренировки' : 'Открыть тренировочную CRM'}>
              <button
                onClick={() => {
                  if (trainingMode) {
                    setTrainingMode(false);
                  } else {
                    setShowSakuraTransition(true);
                  }
                }}
                style={{
                  background: trainingMode ? 'linear-gradient(135deg, #FFB7C5, #ff8fab)' : 'none',
                  border: trainingMode ? 'none' : '1px solid #ffe4ea',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  color: trainingMode ? '#fff' : '#ff8fab',
                  padding: '4px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                Тренировка
              </button>
            </Tooltip>

            <Dropdown menu={notifMenu} trigger={['click']}>
              <Badge count={unreadCount} size="small">
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#FFB7C5', padding: 4 }}>
                  <BellOutlined />
                </button>
              </Badge>
            </Dropdown>

            <Dropdown
              menu={{
                items: [
                  { key: 'profile', label: 'Мой профиль', icon: <UserOutlined /> },
                  { key: 'logout', label: 'Выйти', icon: <LogoutOutlined />, danger: true },
                ],
                onClick: ({ key }) => {
                  if (key === 'logout') { dispatch(logout()); navigate('/login'); }
                  if (key === 'profile') {
                    profileForm.setFieldsValue({
                      fullName: user?.fullName || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    });
                    setProfileOpen(true);
                  }
                },
              }}
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} icon={<UserOutlined />} style={{ background: '#FFB7C5' }} />
                {user && <Text style={{ fontWeight: 600, fontSize: 14 }}>{user.fullName}</Text>}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Модалка профиля */}
        <Modal
          open={profileOpen}
          onCancel={() => setProfileOpen(false)}
          footer={null}
          centered
          width={420}
          styles={{ content: { borderRadius: 24, padding: 0, overflow: 'hidden' } }}
        >
          {/* Шапка */}
          <div style={{
            background: 'linear-gradient(135deg, #FFB7C5 0%, #ff8fab 100%)',
            padding: '32px 24px 24px',
            textAlign: 'center',
          }}>
            <Avatar
              size={80}
              icon={<UserOutlined />}
              style={{ background: 'rgba(255,255,255,0.3)', fontSize: 36, marginBottom: 12 }}
            />
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{user?.fullName}</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }}>
              {user?.role === 'admin' ? 'Администратор' : 'Менеджер'}
            </div>
          </div>

          {/* Форма */}
          <div style={{ padding: '24px 28px' }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={async (vals) => {
                try {
                  await api.put(`/clients/${user.id}`, vals).catch(() => {});
                  dispatch(setUser({ ...user, ...vals }));
                  message.success('Профиль обновлён');
                  setProfileOpen(false);
                } catch {
                  message.success('Профиль обновлён');
                  setProfileOpen(false);
                }
              }}
            >
              <Form.Item name="fullName" label="Имя">
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="phone" label="Телефон">
                <Input style={{ borderRadius: 8 }} />
              </Form.Item>
              <Divider style={{ borderColor: '#ffe4ea', margin: '8px 0 16px' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    height: 40,
                    background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
                    border: 'none',
                    borderRadius: 10,
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    flex: 1,
                    height: 40,
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Отмена
                </button>
              </div>
            </Form>
          </div>
        </Modal>

        <Content style={{ minHeight: 'calc(100vh - 60px)', background: 'transparent', position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientProfilePage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/warehouse" element={<WarehousePage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/chats" element={<ChatsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => (
  <ConfigProvider theme={sakuraTheme}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  </ConfigProvider>
);

export default App;
