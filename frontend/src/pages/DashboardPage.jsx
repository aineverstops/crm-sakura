import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag } from 'antd';
import {
  TeamOutlined, DollarOutlined, CheckSquareOutlined,
  InboxOutlined, WarningOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';

const { Title, Text } = Typography;

const COLORS = ['#FFB7C5', '#ff8fab', '#ffd6e0', '#ffaec9'];

const StatCard = ({ icon, title, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="sakura-card" bodyStyle={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color,
          }}
        >
          {icon}
        </div>
        <Statistic title={title} value={value} valueStyle={{ color: '#1a1a1a', fontWeight: 700 }} />
      </div>
    </Card>
  </motion.div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const pieData = (data?.dealsByStatus || []).map((d) => ({
    name: { new: 'Новая', in_progress: 'В работе', closed: 'Закрыта' }[d.status] || d.status,
    value: Number(d.count),
  }));

  const chartData = (data?.monthlySales || []).map((m) => ({
    month: m.month,
    выручка: Number(m.total || 0),
    сделок: Number(m.count || 0),
  }));

  return (
    <div style={{ padding: '28px 32px' }}>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Дашборд</Title>
      </motion.div>

      <Row id="tour-stat-cards" gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<TeamOutlined />} title="Клиентов" value={data?.clientCount || 0} color="#FFB7C5" delay={0} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<DollarOutlined />} title="Сделок" value={data?.dealCount || 0} color="#ff8fab" delay={0.1} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<CheckSquareOutlined />} title="Задач (откр.)" value={data?.taskCount || 0} color="#ffaec9" delay={0.2} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<InboxOutlined />} title="Товаров" value={data?.productCount || 0} color="#ff91a4" delay={0.3} />
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="sakura-card" bodyStyle={{ padding: 24 }}>
              <Statistic
                title="Выручка (закрытые сделки)"
                value={Number(data?.revenue || 0).toLocaleString('ru-RU')}
                suffix="₸"
                valueStyle={{ color: '#ff8fab', fontWeight: 700, fontSize: 28 }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={16}>
          {data?.lowStockProducts?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card
                className="sakura-card"
                title={<><WarningOutlined style={{ color: '#fa8c16' }} /> Низкий остаток на складе</>}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.lowStockProducts.map((p) => (
                    <Tag key={p.id} color="orange">
                      {p.name}: {p.quantity} / {p.minQuantity}
                    </Tag>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card id="tour-revenue-chart" className="sakura-card" title="Выручка за 6 месяцев" bodyStyle={{ padding: 20 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sakuraGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFB7C5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FFB7C5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffe4ea" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => `${v.toLocaleString('ru-RU')} ₸`} />
                    <Area type="monotone" dataKey="выручка" stroke="#FFB7C5" strokeWidth={2} fill="url(#sakuraGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Text type="secondary">Нет данных за последние 6 месяцев</Text>
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card id="tour-pie-chart" className="sakura-card" title="Сделки по статусам" bodyStyle={{ padding: 20 }}>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Text type="secondary">Нет сделок</Text>
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
