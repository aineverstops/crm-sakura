import React, { useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';
import { WhatsAppOutlined, SendOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../store/notificationsSlice';

// Имена совпадают с demo-чатами в ChatsPage
const DEMO_MESSAGES = [
  { source: 'whatsapp', chatId: 'wa1', from: 'Аяна Бекова',     text: 'Здравствуйте! Когда будет готов мой заказ?' },
  { source: 'telegram', chatId: 'tg1', from: 'Эльмира Жаксыбек', text: 'Добрый день, можно уточнить цену на товар?' },
  { source: 'whatsapp', chatId: 'wa3', from: 'Гульмира Сатова',  text: 'Могу я получить счёт на оплату?' },
  { source: 'telegram', chatId: 'tg3', from: 'Молдир Аскарова',  text: 'Когда следующая поставка будет?' },
  { source: 'whatsapp', chatId: 'wa2', from: 'Берик Нурланов',   text: 'Изучил предложение — готов обсудить!' },
];

const SOUND_KEY     = 'crm_sound_enabled';
const DEMO_NOTIF_KEY = 'crm_demo_notifications_enabled';

const isSoundEnabled = () => localStorage.getItem(SOUND_KEY) !== 'false';
const isDemoEnabled  = () => localStorage.getItem(DEMO_NOTIF_KEY) !== 'false';

const playNotificationSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
};

// Добавляет входящее сообщение в чат в localStorage
const pushMessageToChat = (msg) => {
  const key = `crm_chats_${msg.source}`;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return; // чаты ещё не открывали — пропускаем
    const chats = JSON.parse(stored);
    const updated = chats.map((c) =>
      c.id === msg.chatId
        ? { ...c, unread: (c.unread || 0) + 1, messages: [...c.messages, { id: Date.now(), text: msg.text, time: new Date().toISOString(), from: 'them' }] }
        : c
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
};

const NotificationPopup = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const indexRef  = useRef(0);

  const showNotification = useCallback((msg) => {
    const isWA = msg.source === 'whatsapp';

    try { playNotificationSound(); } catch {}

    // Записываем сообщение в localStorage чата
    pushMessageToChat(msg);

    dispatch(addNotification({
      source: msg.source,
      from:   msg.from,
      text:   msg.text,
      chatId: msg.chatId,
      time:   new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }));

    const handleClick = () => {
      // Сообщаем ChatsPage (если уже открыт) через CustomEvent
      window.dispatchEvent(new CustomEvent('crm-open-chat', {
        detail: { tab: msg.source, chatId: msg.chatId },
      }));
      // Навигируем с state как запас на случай первого открытия
      navigate('/chats', { state: { tab: msg.source, chatId: msg.chatId } });
    };

    api.open({
      message: (
        <span style={{ fontWeight: 700, fontSize: 14 }}>
          {isWA
            ? <WhatsAppOutlined style={{ color: '#25D366', marginRight: 8 }} />
            : <SendOutlined    style={{ color: '#229ED9', marginRight: 8 }} />}
          {msg.from}
        </span>
      ),
      description: (
        <div>
          <div style={{ color: '#444', marginBottom: 6 }}>{msg.text}</div>
          <div style={{ fontSize: 11, color: isWA ? '#25D366' : '#229ED9', fontWeight: 600 }}>
            Нажмите, чтобы открыть чат →
          </div>
        </div>
      ),
      placement: 'topRight',
      duration: 6,
      onClick: handleClick,
      style: {
        borderRadius: 16,
        border: `1px solid ${isWA ? '#d4f5e2' : '#d4edf9'}`,
        background: isWA ? '#f0fff7' : '#f0f8ff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      },
      icon: isWA
        ? <WhatsAppOutlined style={{ color: '#25D366', fontSize: 22 }} />
        : <SendOutlined     style={{ color: '#229ED9', fontSize: 22 }} />,
    });
  }, [api, dispatch, navigate]);

  useEffect(() => {
    const timerRef = { current: null };
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 25000;
      timerRef.current = setTimeout(() => {
        const msg = DEMO_MESSAGES[indexRef.current % DEMO_MESSAGES.length];
        indexRef.current += 1;
        if (isDemoEnabled()) showNotification(msg);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, [showNotification]);

  return contextHolder;
};

export default NotificationPopup;
