import React, { useState, useEffect } from 'react';
import { Typography, Card, Calendar, Badge, Modal, Form, Input, DatePicker, Select, Button, List, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Title } = Typography;

const STORAGE_KEY = 'crm_calendar_events';

const loadEvents = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveEvents = (events) => localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

const TYPE_COLOR = { call: 'pink', meeting: 'blue', task: 'green', other: 'default' };
const TYPE_LABEL = { call: 'Звонок', meeting: 'Встреча', task: 'Задача', other: 'Другое' };

const CalendarPage = () => {
  const [events, setEvents] = useState(loadEvents());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => { saveEvents(events); }, [events]);

  const getDateEvents = (date) =>
    events.filter((e) => dayjs(e.date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));

  const dateCellRender = (date) => {
    const list = getDateEvents(date);
    return list.map((e) => (
      <Badge key={e.id} color={TYPE_COLOR[e.type]} text={<span style={{ fontSize: 11 }}>{e.title}</span>} style={{ display: 'block' }} />
    ));
  };

  const handleSelect = (date) => {
    setSelectedDate(date);
    form.setFieldsValue({ date, type: 'call' });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((vals) => {
      const newEvent = { ...vals, id: Date.now(), date: vals.date.toISOString() };
      setEvents((prev) => [...prev, newEvent]);
      setModalOpen(false);
      form.resetFields();
    });
  };

  const todayEvents = getDateEvents(dayjs());

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Календарь</Title>
          <Tooltip title="Создать событие: звонок, встреча, задача или другое — с датой, временем и заметками" placement="left">
            <Button
              id="tour-add-event"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { form.setFieldsValue({ date: dayjs(), type: 'call' }); setModalOpen(true); }}
              style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
            >
              Добавить событие
            </Button>
          </Tooltip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          <Card className="sakura-card" bodyStyle={{ padding: 16 }}>
            <Calendar
              cellRender={(date, info) => info.type === 'date' ? dateCellRender(date) : null}
              onSelect={handleSelect}
            />
          </Card>

          <Card id="tour-today-events" className="sakura-card" title="События сегодня" bodyStyle={{ padding: 16 }}>
            {todayEvents.length > 0 ? (
              <List
                dataSource={todayEvents}
                renderItem={(e) => (
                  <List.Item key={e.id}>
                    <div>
                      <Badge color={TYPE_COLOR[e.type]} text={<strong>{TYPE_LABEL[e.type]}</strong>} />
                      <div style={{ marginTop: 4, fontSize: 13 }}>{e.title}</div>
                      {e.notes && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{e.notes}</div>}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#bbb', padding: 20 }}>
                Событий нет
              </div>
            )}
          </Card>
        </div>
      </motion.div>

      <Modal
        open={modalOpen}
        title="Новое событие"
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okButtonProps={{ style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 } }}
        styles={{ content: { borderRadius: 20 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="date" label="Дата и время" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%', borderRadius: 8 }} format="DD.MM.YYYY HH:mm" />
          </Form.Item>
          <Form.Item name="type" label="Тип">
            <Select options={Object.entries(TYPE_LABEL).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="notes" label="Заметки">
            <Input.TextArea rows={2} style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
