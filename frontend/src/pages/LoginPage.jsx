import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import SakuraPetals from '../components/SakuraPetals';

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token) navigate('/dashboard');
  }, [token, navigate]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const onFinish = (values) => {
    dispatch(login(values));
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Фоновое фото — чёткое */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/fuji.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0,
      }} />

      {/* Лёгкий тёмный оверлей чтобы карточка читалась */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.18)',
        zIndex: 1,
      }} />

      {/* Лепестки поверх фона */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
        <SakuraPetals />
      </div>

      {/* Карточка входа */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 3,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 28,
          padding: '48px 44px',
          width: 420,
          boxShadow: '0 20px 64px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,228,234,0.6)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{ fontSize: 52, marginBottom: 12 }}
          >
            ✦
          </motion.div>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 700 }}>
            CRM Sakura
          </Title>
          <Text style={{ color: '#888', fontSize: 14 }}>Система управления бизнесом</Text>
        </div>

        <style>{`
          .sakura-input .ant-input,
          .sakura-input .ant-input-affix-wrapper {
            border-color: #ffe4ea !important;
            box-shadow: none !important;
          }
          .sakura-input .ant-input-affix-wrapper:hover,
          .sakura-input .ant-input-affix-wrapper:focus,
          .sakura-input .ant-input-affix-wrapper-focused {
            border-color: #FFB7C5 !important;
            box-shadow: 0 0 0 2px rgba(255,183,197,0.2) !important;
          }
          .sakura-input input:-webkit-autofill,
          .sakura-input input:-webkit-autofill:hover,
          .sakura-input input:-webkit-autofill:focus,
          .sakura-input input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 9999px rgba(255,255,255,0.9) inset !important;
            box-shadow: 0 0 0 9999px rgba(255,255,255,0.9) inset !important;
            -webkit-text-fill-color: #1a1a1a !important;
            transition: background-color 99999s ease-in-out 0s;
          }
        `}</style>

        <Form layout="vertical" onFinish={onFinish} size="large" className="sakura-input">
          <Form.Item name="username" rules={[{ required: true, message: 'Введите логин' }]}>
            <Input
              prefix={<UserOutlined style={{ color: '#FFB7C5' }} />}
              placeholder="Логин"
              style={{ borderRadius: 12, height: 48, borderColor: '#ffe4ea' }}
            />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: '#FFB7C5' }} />}
              placeholder="Пароль"
              style={{ borderRadius: 12, height: 48, borderColor: '#ffe4ea' }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #FFB7C5 0%, #ff8fab 100%)',
              border: 'none',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 4px 16px rgba(255,183,197,0.5)',
            }}
          >
            Войти
          </Button>
        </Form>

      </motion.div>
    </div>
  );
};

export default LoginPage;
