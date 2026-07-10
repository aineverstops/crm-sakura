import React, { useEffect, useState } from 'react';
import { Typography, Card, Spin, Row, Col, Statistic } from 'antd';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import api from '../services/api';

const { Title } = Typography;
const COLORS = ['#FFB7C5', '#ff8fab', '#ffd6e0', '#ffaec9', '#FF91A4'];

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/summary').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  const pieData = (data?.dealsByStatus || []).map((d) => ({
    name: { new: 'Новая', in_progress: 'В работе', closed: 'Закрыта' }[d.status] || d.status,
    value: Number(d.count),
  }));

  const salesData = (data?.monthlySales || []).map((m) => ({
    month: m.month,
    выручка: Number(m.total || 0),
    сделок: Number(m.count || 0),
  }));

  return (
    <div style={{ padding: '28px 32px' }}>
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Title level={3} style={{ marginBottom: 28 }}>Аналитика</Title>

        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          {[
            { label: 'Клиентов', value: data?.clientCount, suffix: '' },
            { label: 'Сделок', value: data?.dealCount, suffix: '' },
            { label: 'Выручка', value: Number(data?.revenue || 0).toLocaleString('ru-RU'), suffix: '₸' },
            { label: 'Товаров на складе', value: data?.productCount, suffix: '' },
          ].map((s, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="sakura-card" bodyStyle={{ padding: 24 }}>
                  <Statistic title={s.label} value={s.value} suffix={s.suffix} valueStyle={{ fontWeight: 700, color: '#ff8fab' }} />
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        <Row id="tour-analytics-charts" gutter={[20, 20]}>
          <Col xs={24} lg={16}>
            <Card className="sakura-card" title="Выручка по месяцам" bodyStyle={{ padding: 24 }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB7C5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FFB7C5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffe4ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${Number(v).toLocaleString('ru-RU')} ₸`} />
                  <Area type="monotone" dataKey="выручка" stroke="#FFB7C5" strokeWidth={2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="sakura-card" title="Сделки по статусам" bodyStyle={{ padding: 24 }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24}>
            <Card className="sakura-card" title="Количество сделок по месяцам" bodyStyle={{ padding: 24 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffe4ea" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="сделок" fill="#FFB7C5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
