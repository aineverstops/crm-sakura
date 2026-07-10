import React, { useEffect, useState } from 'react';
import { Avatar, Typography, Card, Tag, Spin, Row, Col, Empty, Button, Divider } from 'antd';
import { UserOutlined, ArrowLeftOutlined, PhoneOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}`)
      .then((r) => setClient(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!client) return <Empty description="Клиент не найден" />;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/clients')}
        type="text"
        style={{ marginBottom: 20, color: '#FFB7C5' }}
      >
        Назад к списку
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Шапка профиля */}
        <Card
          className="sakura-card"
          style={{ marginBottom: 24 }}
          bodyStyle={{ padding: 32 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar
              size={90}
              src={client.avatar}
              icon={<UserOutlined />}
              style={{
                background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
                fontSize: 36,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <Title level={2} style={{ margin: 0, marginBottom: 6 }}>{client.name}</Title>
              {client.company && (
                <Text style={{ color: '#888', fontSize: 15 }}>
                  <BankOutlined style={{ marginRight: 6 }} />{client.company}
                </Text>
              )}
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {client.phone && (
                  <Tag icon={<PhoneOutlined />} color="pink">{client.phone}</Tag>
                )}
                {client.email && (
                  <Tag icon={<MailOutlined />} color="pink">{client.email}</Tag>
                )}
                <Tag color={client.status === 'active' ? 'green' : 'default'}>
                  {client.status === 'active' ? 'Активен' : 'Неактивен'}
                </Tag>
              </div>
            </div>
          </div>
          {client.notes && (
            <>
              <Divider style={{ borderColor: '#ffe4ea' }} />
              <Text style={{ color: '#666' }}>{client.notes}</Text>
            </>
          )}
        </Card>

        <Row gutter={[20, 20]}>
          {/* Сделки */}
          <Col xs={24} lg={12}>
            <Card className="sakura-card" title="Сделки" bodyStyle={{ padding: 16 }}>
              {client.deals?.length > 0 ? client.deals.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '10px 14px',
                    background: '#fff5f7',
                    borderRadius: 10,
                    marginBottom: 8,
                    border: '1px solid #ffe4ea',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{d.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Tag color={{ new: 'blue', in_progress: 'orange', closed: 'green' }[d.status]}>
                      {{ new: 'Новая', in_progress: 'В работе', closed: 'Закрыта' }[d.status]}
                    </Tag>
                    <Text style={{ fontWeight: 600 }}>{Number(d.amount).toLocaleString('ru-RU')} ₸</Text>
                  </div>
                </div>
              )) : <Empty description="Нет сделок" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>
          </Col>

          {/* Задачи / "стена" */}
          <Col xs={24} lg={12}>
            <Card className="sakura-card" title="Задачи" bodyStyle={{ padding: 16 }}>
              {client.tasks?.length > 0 ? client.tasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '10px 14px',
                    background: '#fff5f7',
                    borderRadius: 10,
                    marginBottom: 8,
                    border: '1px solid #ffe4ea',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <Tag color={{ todo: 'default', in_progress: 'blue', done: 'green' }[t.status]}>
                      {{ todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' }[t.status]}
                    </Tag>
                    {t.deadline && (
                      <Text style={{ fontSize: 12, color: '#aaa' }}>
                        {dayjs(t.deadline).format('DD.MM.YYYY')}
                      </Text>
                    )}
                  </div>
                </div>
              )) : <Empty description="Нет задач" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default ClientProfilePage;
