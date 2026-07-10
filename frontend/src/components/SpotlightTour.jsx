import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CloseOutlined } from '@ant-design/icons';

const STEPS = [
  // ── INTRO ────────────────────────────────────────────────────────────
  {
    route: null, selector: null,
    title: 'Добро пожаловать в CRM Sakura!',
    description: 'Сейчас система проведёт вас по всем разделам и объяснит назначение каждой кнопки. Вы можете нажать «Далее» чтобы начать, или «Пропустить» — вернуться к обучению можно в Настройках.',
  },
  // ── SIDEBAR ───────────────────────────────────────────────────────────
  {
    route: '/dashboard', selector: '#menu-dashboard',
    title: 'Дашборд',
    description: 'Главная страница системы. Здесь собрана вся ключевая статистика: клиенты, сделки, задачи, склад. Нажмите на этот пункт в левом меню, чтобы перейти на дашборд.',
  },
  // ── DASHBOARD CONTENT ─────────────────────────────────────────────────
  {
    route: '/dashboard', selector: '#tour-stat-cards',
    title: 'Карточки статистики',
    description: 'Четыре карточки в реальном времени показывают: количество клиентов в базе, активных сделок, открытых задач и товаров на складе. Обновляются автоматически.',
  },
  {
    route: '/dashboard', selector: '#tour-revenue-chart',
    title: 'График выручки',
    description: 'Интерактивный график-площадь показывает выручку по закрытым сделкам за последние 6 месяцев. Наведите мышь на точку — увидите точную сумму за месяц.',
  },
  {
    route: '/dashboard', selector: '#tour-pie-chart',
    title: 'Круговая диаграмма',
    description: 'Показывает соотношение сделок по статусам: Новая, В работе и Закрыта. Помогает оценить состояние воронки продаж одним взглядом.',
  },
  // ── CLIENTS ───────────────────────────────────────────────────────────
  {
    route: '/clients', selector: '#menu-clients',
    title: 'Раздел «Клиенты»',
    description: 'Полная база ваших клиентов. Нажмите на этот пункт меню чтобы перейти к списку. Здесь можно искать, добавлять, редактировать и удалять клиентов.',
  },
  {
    route: '/clients', selector: '#tour-search',
    title: 'Строка поиска клиентов',
    description: 'Введите любое слово — система мгновенно ищет по имени, компании, email и телефону одновременно. Не нужно нажимать Enter — результаты появляются по мере ввода.',
  },
  {
    route: '/clients', selector: '#tour-add-client',
    title: 'Кнопка «Добавить клиента»',
    description: 'Открывает форму создания нового клиента. Заполните: имя (обязательно), компанию, email, телефон и заметки. После сохранения клиент сразу появляется в таблице.',
  },
  // ── DEALS ─────────────────────────────────────────────────────────────
  {
    route: '/deals', selector: '#menu-deals',
    title: 'Раздел «Сделки»',
    description: 'Канбан-доска для управления воронкой продаж. Три колонки: «Новая», «В работе», «Закрыта». Перетаскивайте карточки между колонками — статус обновляется автоматически.',
  },
  {
    route: '/deals', selector: '#tour-add-deal',
    title: 'Кнопка «Новая сделка»',
    description: 'Создать сделку: укажите название, выберите клиента из базы, введите сумму в тенге. Сделка появится в колонке «Новая». Перетащите её в «В работе» когда начнёте работать.',
  },
  {
    route: '/deals', selector: '#tour-kanban-board',
    title: 'Канбан-доска сделок',
    description: 'Перетащите карточку сделки из одной колонки в другую — статус изменится мгновенно. При переносе в «Закрыта» фиксируется дата закрытия и сумма учитывается в выручке на дашборде.',
  },
  // ── TASKS ─────────────────────────────────────────────────────────────
  {
    route: '/tasks', selector: '#menu-tasks',
    title: 'Раздел «Задачи»',
    description: 'Список задач для менеджеров. У каждой задачи есть дедлайн и приоритет (Низкий/Средний/Высокий). Просроченные дедлайны выделяются красным цветом.',
  },
  {
    route: '/tasks', selector: '#tour-add-task',
    title: 'Кнопка «Добавить задачу»',
    description: 'Создать задачу: укажите название, дедлайн (дата выполнения), приоритет и привяжите к клиенту. Галочкой в таблице можно быстро отметить задачу выполненной.',
  },
  // ── LEADS ─────────────────────────────────────────────────────────────
  {
    route: '/leads', selector: '#menu-leads',
    title: 'Раздел «Лиды»',
    description: 'Управление потенциальными клиентами. Лид — это человек, который ещё не стал клиентом. Отслеживайте источник и статус работы с каждым лидом.',
  },
  {
    route: '/leads', selector: '#tour-add-lead',
    title: 'Кнопка «Добавить лид»',
    description: 'Создать карточку потенциального клиента. Укажите источник — откуда он пришёл: Сайт, Instagram, WhatsApp, Telegram или рекомендация. Статус меняйте по мере работы.',
  },
  // ── ANALYTICS ─────────────────────────────────────────────────────────
  {
    route: '/analytics', selector: '#menu-analytics',
    title: 'Раздел «Аналитика»',
    description: 'Детальные графики и отчёты по бизнесу. Выручка по месяцам, количество сделок, распределение по статусам. Это основа для принятия управленческих решений.',
  },
  {
    route: '/analytics', selector: '#tour-analytics-charts',
    title: 'Графики аналитики',
    description: 'Три типа графиков: площадь (выручка по месяцам), столбцы (количество сделок), круговой (статусы). Наведите мышь на любой элемент — появится всплывающая подсказка с точными данными.',
  },
  // ── CALENDAR ──────────────────────────────────────────────────────────
  {
    route: '/calendar', selector: '#menu-calendar',
    title: 'Раздел «Календарь»',
    description: 'Планирование звонков, встреч и других событий. Нажмите на любую дату в календаре — откроется форма создания события на этот день.',
  },
  {
    route: '/calendar', selector: '#tour-add-event',
    title: 'Кнопка «Добавить событие»',
    description: 'Создать событие: выберите тип (Звонок, Встреча, Задача), укажите дату, время и заметки. Событие появится на выбранной дате в календаре и в правой панели.',
  },
  {
    route: '/calendar', selector: '#tour-today-events',
    title: 'События сегодня',
    description: 'Правая колонка показывает все события запланированные на сегодня. Удобно проверять с утра чтобы не пропустить звонки и встречи.',
  },
  // ── WAREHOUSE ─────────────────────────────────────────────────────────
  {
    route: '/warehouse', selector: '#menu-warehouse',
    title: 'Раздел «Склад»',
    description: 'Учёт товарных позиций и накладных. Вкладка «Товары» — каталог с текущими остатками. Вкладка «Накладные» — история всех приходных и расходных документов.',
  },
  {
    route: '/warehouse', selector: '#tour-add-product',
    title: 'Кнопка «Добавить товар»',
    description: 'Добавить новую позицию: название, артикул, штрихкод, цена продажи, себестоимость, текущий остаток и минимальный порог. Когда остаток упадёт ниже минимума — появится предупреждение «Мало!».',
  },
  {
    route: '/warehouse', selector: '#tour-create-invoice',
    title: 'Кнопка «Создать накладную»',
    description: 'Открывает форму накладной. Выберите тип (Расходная = продажа клиенту, Приходная = поступление от поставщика), добавьте товарные позиции. После создания — остатки обновятся и откроется PDF для печати.',
  },
  // ── EMPLOYEES ─────────────────────────────────────────────────────────
  {
    route: '/employees', selector: '#menu-employees',
    title: 'Раздел «Сотрудники»',
    description: 'Управление учётными записями. Два типа ролей: Администратор — полный доступ ко всем разделам, Менеджер — работа с клиентами, сделками и задачами.',
  },
  {
    route: '/employees', selector: '#tour-add-employee',
    title: 'Кнопка «Добавить сотрудника»',
    description: 'Создать новую учётную запись: ФИО, логин, пароль и роль. После создания сотрудник сможет войти в систему со своими данными. Администратора удалить нельзя.',
  },
  {
    route: '/employees', selector: '#tour-employees-grid',
    title: 'Карточки сотрудников',
    description: 'Нажмите на карточку — откроется форма редактирования: имя, контакты, роль. Нажмите на фото профиля — загрузите новое изображение с компьютера.',
  },
  // ── SETTINGS ──────────────────────────────────────────────────────────
  {
    route: '/settings', selector: '#menu-settings',
    title: 'Раздел «Настройки»',
    description: 'Параметры всей системы: информация о компании, управление уведомлениями и подключение WhatsApp / Telegram через API.',
  },
  {
    route: '/settings', selector: '#tour-company-form',
    title: 'Информация о компании',
    description: 'Введите название компании, юридический адрес, телефон и email. Эти данные автоматически подставляются в накладные и другие документы при печати.',
  },
  {
    route: '/settings', selector: '#tour-notifications',
    title: 'Управление уведомлениями',
    description: 'Три переключателя: звук при входящих сообщениях, предупреждения о низком остатке товаров на складе, и демо-режим уведомлений для тестирования системы.',
  },
  // ── OUTRO ─────────────────────────────────────────────────────────────
  {
    route: null, selector: null,
    title: 'Обучение завершено!',
    description: 'Теперь вы знаете все основные функции CRM Sakura. Если захотите повторить обучение — откройте Настройки и включите «Показывать обучение при входе». Удачной работы!',
  },
];

const SpotlightTour = ({ onFinish }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const timerRef = useRef(null);

  const findTarget = useCallback((selector) => {
    if (!selector) { setRect(null); return; }
    let attempts = 0;
    const tryFind = () => {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        timerRef.current = setTimeout(() => {
          const r = el.getBoundingClientRect();
          setRect({ x: r.x, y: r.y, width: r.width, height: r.height });
        }, 30);
      } else if (attempts < 10) {
        attempts++;
        timerRef.current = setTimeout(tryFind, 60);
      } else {
        setRect(null);
      }
    };
    tryFind();
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    const step = STEPS[idx];
    setRect(null);
    setWaiting(false);
    if (!step.selector) return;

    if (step.route && location.pathname !== step.route) {
      setWaiting(true);
      navigate(step.route);
    } else {
      findTarget(step.selector);
    }
  }, [idx]); // eslint-disable-line

  useEffect(() => {
    if (!waiting) return;
    const step = STEPS[idx];
    if (step.route && location.pathname === step.route) {
      setWaiting(false);
      timerRef.current = setTimeout(() => findTarget(step.selector), 120);
    }
  }, [location.pathname, waiting]); // eslint-disable-line

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const step = STEPS[idx];
  if (!step) return null;

  const PAD = 14;
  const PW = 370;
  const PH = 230;
  const W = window.innerWidth;
  const H = window.innerHeight;

  let panelTop, panelLeft;
  if (!rect) {
    panelTop = H / 2 - PH / 2;
    panelLeft = W / 2 - PW / 2;
  } else {
    const below = rect.y + rect.height + PAD + PH + 8;
    panelTop = below < H - 16 ? rect.y + rect.height + PAD + 8 : rect.y - PH - PAD - 8;
    panelLeft = Math.max(16, Math.min(rect.x, W - PW - 16));
  }

  const isLast = idx === STEPS.length - 1;

  return (
    <>
      {/* Click blocker */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9985 }} />

      {/* SVG spotlight overlay */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 9986, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="sakura-tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.x - PAD} y={rect.y - PAD}
                width={rect.width + PAD * 2} height={rect.height + PAD * 2}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.74)" mask="url(#sakura-tour-mask)" />
        {rect && (
          <>
            {/* Pink glow border around spotlight */}
            <rect
              x={rect.x - PAD} y={rect.y - PAD}
              width={rect.width + PAD * 2} height={rect.height + PAD * 2}
              rx="14" fill="none" stroke="#FFB7C5" strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,183,197,0.9))' }}
            />
            {/* Corner accents */}
            <rect x={rect.x - PAD} y={rect.y - PAD} width={16} height={3} rx="2" fill="#ff8fab" />
            <rect x={rect.x - PAD} y={rect.y - PAD} width={3} height={16} rx="2" fill="#ff8fab" />
            <rect x={rect.x + rect.width + PAD - 16} y={rect.y - PAD} width={16} height={3} rx="2" fill="#ff8fab" />
            <rect x={rect.x + rect.width + PAD - 3} y={rect.y - PAD} width={3} height={16} rx="2" fill="#ff8fab" />
            <rect x={rect.x - PAD} y={rect.y + rect.height + PAD - 3} width={16} height={3} rx="2" fill="#ff8fab" />
            <rect x={rect.x - PAD} y={rect.y + rect.height + PAD - 16} width={3} height={16} rx="2" fill="#ff8fab" />
            <rect x={rect.x + rect.width + PAD - 16} y={rect.y + rect.height + PAD - 3} width={16} height={3} rx="2" fill="#ff8fab" />
            <rect x={rect.x + rect.width + PAD - 3} y={rect.y + rect.height + PAD - 16} width={3} height={16} rx="2" fill="#ff8fab" />
          </>
        )}
      </svg>

      {/* Info panel */}
      <div style={{
        position: 'fixed',
        top: Math.max(16, Math.min(panelTop, H - PH - 16)),
        left: panelLeft,
        width: PW,
        zIndex: 9999,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 20,
        padding: '22px 26px 20px',
        boxShadow: '0 24px 72px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,183,197,0.25)',
        border: '1px solid #ffe4ea',
        pointerEvents: 'all',
        transition: 'top 0.25s ease, left 0.25s ease',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#FFB7C5', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            ШАГ {idx + 1} / {STEPS.length}
          </span>
          <button
            onClick={() => onFinish(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 2, lineHeight: 1, display: 'flex' }}
          >
            <CloseOutlined style={{ fontSize: 13 }} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#fff0f4', borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #FFB7C5, #ff8fab)',
            borderRadius: 99,
            width: `${((idx + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.35s ease',
          }} />
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 9, lineHeight: 1.3 }}>
          {step.title}
        </div>

        {/* Description */}
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 20 }}>
          {step.description}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {idx > 0 && (
            <button
              onClick={() => setIdx(idx - 1)}
              style={{
                background: '#f5f5f5', border: 'none', borderRadius: 10,
                padding: '8px 14px', cursor: 'pointer',
                fontWeight: 600, fontSize: 13, color: '#555',
              }}
            >
              ← Назад
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => onFinish(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 12, padding: '8px 10px' }}
          >
            Пропустить
          </button>
          <button
            onClick={() => { if (isLast) onFinish(true); else setIdx(idx + 1); }}
            style={{
              background: 'linear-gradient(135deg, #FFB7C5, #ff8fab)',
              border: 'none', borderRadius: 10,
              padding: '9px 20px', cursor: 'pointer',
              color: '#fff', fontWeight: 700, fontSize: 13,
              boxShadow: '0 4px 14px rgba(255,139,171,0.4)',
            }}
          >
            {isLast ? 'Завершить' : 'Далее →'}
          </button>
        </div>
      </div>
    </>
  );
};

export default SpotlightTour;
