import React, { useState } from 'react';
import { Modal, Button, Typography, Tour } from 'antd';
import { useDispatch } from 'react-redux';
import { clearFirstLogin } from '../store/authSlice';

const { Title, Paragraph } = Typography;

const TOUR_STEPS = [
  {
    title: 'Дашборд',
    description: 'Главная страница системы. Здесь отображаются ключевые показатели: количество клиентов, активных сделок, открытых задач и товаров на складе. Также показаны графики выручки за последние 6 месяцев и предупреждения о низких остатках товаров.',
    target: () => document.getElementById('menu-dashboard'),
  },
  {
    title: 'Клиенты',
    description: 'База данных всех ваших клиентов. Поиск по имени, компании, телефону и email. Нажмите на клиента — откроется его профиль с историей всех сделок и задач. Средняя кнопка мыши открывает профиль в новой вкладке.',
    target: () => document.getElementById('menu-clients'),
  },
  {
    title: 'Сделки',
    description: 'Канбан-доска для управления воронкой продаж. Три колонки: «Новая», «В работе», «Закрыта». Карточки сделок можно перетаскивать между колонками — статус обновляется автоматически.',
    target: () => document.getElementById('menu-deals'),
  },
  {
    title: 'Задачи',
    description: 'Список задач для менеджеров с дедлайнами и приоритетами. Просроченные дедлайны подсвечиваются красным. Задачи можно быстро отмечать выполненными прямо из списка.',
    target: () => document.getElementById('menu-tasks'),
  },
  {
    title: 'Лиды',
    description: 'Управление потенциальными клиентами. Отслеживайте источник лида (WhatsApp, Instagram и др.) и его статус. Кнопка конвертации переводит лида в полноценного клиента одним нажатием.',
    target: () => document.getElementById('menu-leads'),
  },
  {
    title: 'Аналитика',
    description: 'Детальные графики: выручка по месяцам, количество сделок, распределение по статусам. Помогает отслеживать динамику бизнеса и принимать решения на основе данных.',
    target: () => document.getElementById('menu-analytics'),
  },
  {
    title: 'Календарь',
    description: 'Планирование звонков, встреч и задач. Нажмите на любую дату чтобы добавить событие. В правой колонке отображаются события на сегодня.',
    target: () => document.getElementById('menu-calendar'),
  },
  {
    title: 'Склад',
    description: 'Управление товарными остатками. Вкладка «Товары» — каталог с остатками и ценами. Вкладка «Накладные» — история приходных и расходных документов. Кнопка «Создать накладную» автоматически списывает товар и открывает PDF.',
    target: () => document.getElementById('menu-warehouse'),
  },
  {
    title: 'Сотрудники',
    description: 'Управление учётными записями сотрудников. Нажмите на карточку сотрудника чтобы редактировать данные или сменить фото. Роли: Администратор имеет полный доступ, Менеджер — ограниченный.',
    target: () => document.getElementById('menu-employees'),
  },
  {
    title: 'Настройки',
    description: 'Параметры системы: информация о компании, управление уведомлениями, подключение WhatsApp и Telegram. Здесь же можно отключить звук и тестовые сообщения.',
    target: () => document.getElementById('menu-settings'),
  },
];

const OnboardingTour = ({ onFinish }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState('welcome');
  const [tourOpen, setTourOpen] = useState(false);

  const handleYes = () => {
    setStep('tour');
    setTimeout(() => setTourOpen(true), 100);
  };

  const handleNo = () => {
    dispatch(clearFirstLogin());
    onFinish();
  };

  const handleTourClose = () => {
    setTourOpen(false);
    dispatch(clearFirstLogin());
    onFinish();
  };

  return (
    <>
      {/* Приветственное окно */}
      <Modal
        open={step === 'welcome'}
        footer={null}
        closable={false}
        centered
        width={480}
        styles={{
          content: {
            borderRadius: 24,
            padding: 40,
            background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
            border: '1px solid #ffe4ea',
          },
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16, color: '#FFB7C5' }}>✦</div>
          <Title level={3} style={{ color: '#1a1a1a', marginBottom: 8 }}>
            Добро пожаловать в CRM Sakura!
          </Title>
          <Paragraph style={{ color: '#888', marginBottom: 32 }}>
            Хотите, чтобы мы провели вас по всем разделам системы и объяснили как ей пользоваться?
          </Paragraph>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleYes}
              style={{
                background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
                border: 'none', borderRadius: 12, height: 44, paddingInline: 28, fontWeight: 600,
              }}
            >
              Да, покажите!
            </Button>
            <Button size="large" onClick={handleNo} style={{ borderRadius: 12, height: 44, paddingInline: 28 }}>
              Нет, спасибо
            </Button>
          </div>
        </div>
      </Modal>

      {/* Тур по меню */}
      <Tour
        open={tourOpen}
        onClose={handleTourClose}
        onFinish={handleTourClose}
        steps={TOUR_STEPS}
        indicatorsRender={(current, total) => (
          <span style={{ color: '#ff8fab', fontWeight: 600 }}>{current + 1} / {total}</span>
        )}
        styles={{
          content: { borderRadius: 16 },
        }}
        nextButtonProps={{
          children: 'Далее →',
          style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 },
        }}
        prevButtonProps={{ children: '← Назад', style: { borderRadius: 8 } }}
        finishButtonProps={{
          children: 'Завершить',
          style: { background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)', border: 'none', borderRadius: 8 },
        }}
      />
    </>
  );
};

export default OnboardingTour;
