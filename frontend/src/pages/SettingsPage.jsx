import React, { useState } from 'react';
import { Typography, Card, Form, Input, Button, Switch, Divider, Tag, Row, Col, Alert, message, Tooltip } from 'antd';
import { WhatsAppOutlined, SendOutlined, ApiOutlined, BellOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const SOUND_KEY = 'crm_sound_enabled';
const STOCK_KEY = 'crm_stock_alerts_enabled';
const DEMO_NOTIF_KEY = 'crm_demo_notifications_enabled';
const COMPANY_KEY = 'crm_company_info';
const TOUR_DONE_KEY = 'crm_tour_done';

const loadCompany = () => {
  try { return JSON.parse(localStorage.getItem(COMPANY_KEY)) || {}; } catch { return {}; }
};

const SettingsPage = () => {
  const [companyForm] = Form.useForm();
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem(SOUND_KEY) !== 'false'
  );
  const [stockEnabled, setStockEnabled] = useState(
    localStorage.getItem(STOCK_KEY) !== 'false'
  );
  const [demoEnabled, setDemoEnabled] = useState(
    localStorage.getItem(DEMO_NOTIF_KEY) !== 'false'
  );
  const [tourEnabled, setTourEnabled] = useState(
    localStorage.getItem(TOUR_DONE_KEY) !== 'true'
  );

  const handleSoundToggle = (checked) => {
    setSoundEnabled(checked);
    localStorage.setItem(SOUND_KEY, String(checked));
    message.success(checked ? 'Звук уведомлений включён' : 'Звук уведомлений отключён');
  };

  const handleStockToggle = (checked) => {
    setStockEnabled(checked);
    localStorage.setItem(STOCK_KEY, String(checked));
  };

  const handleDemoToggle = (checked) => {
    setDemoEnabled(checked);
    localStorage.setItem(DEMO_NOTIF_KEY, String(checked));
    message.success(checked ? 'Тестовые уведомления включены' : 'Тестовые уведомления отключены');
  };

  const handleTourToggle = (checked) => {
    setTourEnabled(checked);
    if (checked) {
      localStorage.removeItem(TOUR_DONE_KEY);
      message.success('Обучение будет предложено при следующем входе');
    } else {
      localStorage.setItem(TOUR_DONE_KEY, 'true');
      message.success('Предложение обучения отключено');
    }
  };

  const handleSaveCompany = (vals) => {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(vals));
    message.success('Информация о компании сохранена');
  };

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Настройки</Title>

        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12}>
            <Card id="tour-company-form" className="sakura-card" title="Информация о компании" bodyStyle={{ padding: 24 }}>
              <Form
                form={companyForm}
                layout="vertical"
                initialValues={{ name: 'ООО «Малый Бизнес»', ...loadCompany() }}
                onFinish={handleSaveCompany}
              >
                <Form.Item name="name" label="Название компании">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="address" label="Адрес">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="phone" label="Телефон">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input style={{ borderRadius: 8 }} />
                </Form.Item>
                <Tooltip title="Сохранить название, адрес, телефон и email компании — используются в накладных и документах">
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10 }}
                  >
                    Сохранить
                  </Button>
                </Tooltip>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card id="tour-notifications" className="sakura-card" title={<><BellOutlined /> Уведомления</>} bodyStyle={{ padding: 24 }} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Звуковые уведомления</div>
                  <Text style={{ fontSize: 13, color: '#888' }}>Звук при входящих сообщениях</Text>
                </div>
                <Tooltip title="Включить / отключить звуковой сигнал при получении уведомлений WhatsApp и Telegram">
                  <Switch checked={soundEnabled} onChange={handleSoundToggle} />
                </Tooltip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Уведомления об остатках</div>
                  <Text style={{ fontSize: 13, color: '#888' }}>Предупреждение при низком запасе</Text>
                </div>
                <Tooltip title="Показывать предупреждение на дашборде, когда остаток товара опускается ниже минимума">
                  <Switch checked={stockEnabled} onChange={handleStockToggle} />
                </Tooltip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Тестовые сообщения</div>
                  <Text style={{ fontSize: 13, color: '#888' }}>Демо-уведомления WhatsApp / Telegram</Text>
                </div>
                <Tooltip title="Включить демо-режим: система будет имитировать входящие сообщения каждые 15–40 секунд">
                  <Switch checked={demoEnabled} onChange={handleDemoToggle} />
                </Tooltip>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Показывать обучение при входе</div>
                  <Text style={{ fontSize: 13, color: '#888' }}>Предлагать пройти тур при авторизации</Text>
                </div>
                <Tooltip title="Если включено — после входа система предложит пройти обучение. Отключите, когда освоите CRM.">
                  <Switch checked={tourEnabled} onChange={handleTourToggle} />
                </Tooltip>
              </div>
            </Card>

            <Card className="sakura-card" title={<><ApiOutlined /> Интеграции</>} bodyStyle={{ padding: 24 }}>
              <Alert
                message="API-ключи требуют настройки"
                description="Укажите токены для активации интеграций. Подробности — в README.md."
                type="info"
                showIcon
                style={{ marginBottom: 20, borderRadius: 12 }}
              />

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <WhatsAppOutlined style={{ color: '#25D366', fontSize: 20 }} />
                  <span style={{ fontWeight: 600 }}>WhatsApp Business API</span>
                  <Tag color="orange">Требует API-ключ</Tag>
                </div>
                <Input placeholder="Токен WhatsApp Business API" style={{ borderRadius: 8, marginBottom: 8 }} />
                <Input placeholder="Номер телефона (с кодом страны)" style={{ borderRadius: 8 }} />
              </div>

              <Divider style={{ borderColor: '#ffe4ea' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <SendOutlined style={{ color: '#229ED9', fontSize: 20 }} />
                  <span style={{ fontWeight: 600 }}>Telegram Bot</span>
                  <Tag color="orange">Требует Bot Token</Tag>
                </div>
                <Input placeholder="Bot Token (@BotFather)" style={{ borderRadius: 8, marginBottom: 8 }} />
                <Input placeholder="Chat ID или Username" style={{ borderRadius: 8 }} />
              </div>

              <Button
                type="primary"
                style={{ marginTop: 20, background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 10, width: '100%' }}
              >
                Сохранить интеграции
              </Button>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
