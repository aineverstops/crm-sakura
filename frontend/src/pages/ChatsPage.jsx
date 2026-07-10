import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Typography, Input, Button, Avatar, Tabs, Card, Tag, Badge, Tooltip, Divider, notification } from 'antd';
import {
  SendOutlined, UserOutlined, WhatsAppOutlined, MessageOutlined,
  StarOutlined, StarFilled, DeleteOutlined, CheckOutlined,
  SearchOutlined, CrownOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { tgGetUpdates, tgSendMessage, tgDeleteWebhook } from '../services/telegramService';
import { waReceiveNotification, waDeleteNotification, waSendMessage, waGetStateInstance } from '../services/whatsappService';
import { addNotification } from '../store/notificationsSlice';

const { Title, Text } = Typography;

// ─── Employee Chat ─────────────────────────────────────────────────────────────
const EMP_CHAT_KEY = 'crm_employee_chat';
const EMP_CHANNEL  = 'crm_employee_chat_bc';

const loadEmpMessages = () => { try { return JSON.parse(localStorage.getItem(EMP_CHAT_KEY) || '[]'); } catch { return []; } };
const saveEmpMessages = (m) => localStorage.setItem(EMP_CHAT_KEY, JSON.stringify(m.slice(-500)));

const EmployeeChat = ({ user }) => {
  const [messages, setMessages] = useState(loadEmpMessages);
  const [input, setInput]       = useState('');
  const bottomRef  = useRef(null);
  const channelRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    try {
      channelRef.current = new BroadcastChannel(EMP_CHANNEL);
      channelRef.current.onmessage = (e) => {
        if (e.data?.type === 'msg') {
          setMessages((prev) => { const u = [...prev, e.data.payload]; saveEmpMessages(u); return u; });
        }
      };
    } catch {}
    return () => { try { channelRef.current?.close(); } catch {} };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const msg = { id: Date.now(), text, sender: user?.fullName || 'Пользователь', username: user?.username || 'user', role: user?.role || 'manager', time: new Date().toISOString() };
    const updated = [...messages, msg];
    saveEmpMessages(updated);
    setMessages(updated);
    try { channelRef.current?.postMessage({ type: 'msg', payload: msg }); } catch {}
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const isOwn = (msg) => msg.username === user?.username;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 230px)', minHeight: 400 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', paddingTop: 60 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb' }}>Чат пока пустой</div>
            <div style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Напишите первое сообщение коллегам!</div>
          </div>
        )}
        {messages.map((msg) => {
          const own = isOwn(msg);
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
              {!own && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
                  <Avatar size={22} icon={<UserOutlined />} style={{ background: msg.role === 'admin' ? 'linear-gradient(135deg,#FFB7C5,#ff8fab)' : '#ffd6e0', flexShrink: 0 }} />
                  <Text style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{msg.sender}</Text>
                  {msg.role === 'admin' && <CrownOutlined style={{ fontSize: 10, color: '#FFB7C5' }} />}
                </div>
              )}
              <div style={{ maxWidth: '68%', background: own ? 'linear-gradient(135deg,#FFB7C5,#ff8fab)' : 'rgba(255,255,255,0.95)', color: own ? '#fff' : '#1a1a1a', border: own ? 'none' : '1px solid #ffe4ea', borderRadius: own ? '18px 18px 4px 18px' : '4px 18px 18px 18px', padding: '10px 15px', fontSize: 14, lineHeight: 1.55, boxShadow: own ? '0 4px 14px rgba(255,139,171,0.3)' : '0 1px 4px rgba(0,0,0,0.05)', wordBreak: 'break-word' }}>
                {msg.text}
              </div>
              <Text style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>{dayjs(msg.time).format('HH:mm')}</Text>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #ffe4ea', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onPressEnter={send} placeholder="Напишите сообщение... (Enter для отправки)" style={{ borderRadius: 22, borderColor: '#ffe4ea', flex: 1, height: 40 }} />
        <Button type="primary" icon={<SendOutlined />} onClick={send} disabled={!input.trim()} style={{ borderRadius: 22, background: 'linear-gradient(135deg,#FFB7C5,#ff8fab)', border: 'none', width: 44, height: 40, flexShrink: 0 }} />
      </div>
    </div>
  );
};

// ─── Real Telegram storage ────────────────────────────────────────────────────
const TG_REAL_KEY   = 'crm_tg_real_chats';
const TG_OFFSET_KEY = 'crm_tg_offset';
const loadTgReal  = () => { try { return JSON.parse(localStorage.getItem(TG_REAL_KEY) || '{}'); } catch { return {}; } };
const saveTgReal  = (m) => localStorage.setItem(TG_REAL_KEY, JSON.stringify(m));

// ─── Real WhatsApp storage ────────────────────────────────────────────────────
const WA_REAL_KEY = 'crm_wa_real_chats';
const loadWaReal  = () => { try { return JSON.parse(localStorage.getItem(WA_REAL_KEY) || '{}'); } catch { return {}; } };
const saveWaReal  = (m) => localStorage.setItem(WA_REAL_KEY, JSON.stringify(m));

// ─── TelegramMessenger (real bot polling) ────────────────────────────────────
const TelegramMessenger = ({ pendingChatId, onChatOpened }) => {
  const dispatch  = useDispatch();
  const mapRef    = useRef(loadTgReal());
  const [chatsMap, setChatsMap] = useState(mapRef.current);
  const [active,   setActive]   = useState(null);
  const [search,   setSearch]   = useState('');
  const [input,    setInput]    = useState('');
  const [hovered,  setHovered]  = useState(null);
  const [status,   setStatus]   = useState('connecting'); // 'connecting' | 'live' | 'error'
  const activeRef  = useRef(null);
  const offsetRef  = useRef(parseInt(localStorage.getItem(TG_OFFSET_KEY) || '0', 10));
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const [notifApi, notifHolder] = notification.useNotification();

  const ACCENT = '#229ED9';

  /* ── helpers ── */
  const updateMap = useCallback((next) => {
    mapRef.current = next;
    saveTgReal(next);
    setChatsMap(next);
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);

  const reconnect = useCallback(async () => {
    setStatus('connecting');
    await tgDeleteWebhook();
    localStorage.removeItem(TG_OFFSET_KEY);
    offsetRef.current = 0;
    // Небольшая пауза — Telegram применяет deleteWebhook ~1 сек
    setTimeout(() => setStatus('live'), 1500);
  }, []);

  /* ── polling ── */
  useEffect(() => {
    let timer;
    let alive = true;

    const poll = async () => {
      if (!alive) return;
      try {
        const updates = await tgGetUpdates(offsetRef.current);
        if (!alive) return;

        if (updates.length > 0) {
          offsetRef.current = updates[updates.length - 1].update_id + 1;
          localStorage.setItem(TG_OFFSET_KEY, String(offsetRef.current));

          const map      = { ...mapRef.current };
          const toNotify = [];

          updates.forEach((upd) => {
            const msg = upd.message || upd.edited_message;
            if (!msg?.text) return;

            const chatId   = String(msg.chat.id);
            const name     = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ')
                             || msg.from?.username
                             || `User ${chatId}`;
            const phone    = msg.from?.username ? `@${msg.from.username}` : chatId;
            const isActive = activeRef.current === chatId;
            const prev     = map[chatId] || { id: chatId, name, phone, favorite: false, unread: 0, messages: [] };

            // deduplicate
            if (prev.messages.some((m) => m.id === msg.message_id)) return;

            map[chatId] = {
              ...prev, name, phone,
              unread:   isActive ? 0 : prev.unread + 1,
              messages: [...prev.messages, {
                id:   msg.message_id,
                text: msg.text,
                time: new Date(msg.date * 1000).toISOString(),
                from: 'them',
              }],
            };
            if (!isActive) toNotify.push({ chatId, name, text: msg.text });
          });

          updateMap(map);
          setStatus('live');

          // notifications for new messages
          toNotify.forEach(({ chatId, name, text }) => {
            dispatch(addNotification({
              source: 'telegram', from: name, text, chatId,
              time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            }));
            notifApi.open({
              message: (
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  <SendOutlined style={{ color: ACCENT, marginRight: 8 }} />{name}
                </span>
              ),
              description: (
                <div>
                  <div style={{ color: '#444', marginBottom: 6 }}>{text}</div>
                  <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>Нажмите, чтобы открыть чат →</div>
                </div>
              ),
              placement: 'topRight',
              duration: 6,
              onClick: () => window.dispatchEvent(new CustomEvent('crm-open-chat', { detail: { tab: 'telegram', chatId } })),
              style: { borderRadius: 16, border: '1px solid #d4edf9', background: '#f0f8ff', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', cursor: 'pointer' },
              icon: <SendOutlined style={{ color: ACCENT, fontSize: 22 }} />,
            });
          });
        } else {
          setStatus('live');
        }
      } catch {
        setStatus('error');
      }
      timer = setTimeout(poll, 4000);
    };

    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, [updateMap, dispatch, notifApi]);

  /* ── open chat from notification ── */
  useEffect(() => {
    if (!pendingChatId) return;
    const target = mapRef.current[pendingChatId];
    if (target) {
      setActive(pendingChatId);
      activeRef.current = pendingChatId;
      updateMap({ ...mapRef.current, [pendingChatId]: { ...target, unread: 0 } });
    }
    onChatOpened?.();
  }, [pendingChatId]); // eslint-disable-line

  /* ── scroll to bottom on chat change ── */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'instant' }); }, [active]);
  const activeMsgsLen = chatsMap[active]?.messages?.length;
  useEffect(() => {
    if (activeMsgsLen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
  }, [activeMsgsLen]);

  /* ── actions ── */
  const selectChat = (chat) => {
    setActive(chat.id);
    activeRef.current = chat.id;
    updateMap({ ...mapRef.current, [chat.id]: { ...mapRef.current[chat.id], unread: 0 } });
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    const c = mapRef.current[id]; if (!c) return;
    updateMap({ ...mapRef.current, [id]: { ...c, favorite: !c.favorite } });
  };

  const markRead = (id, e) => {
    e.stopPropagation();
    const c = mapRef.current[id]; if (!c) return;
    updateMap({ ...mapRef.current, [id]: { ...c, unread: 0 } });
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (active === id) { setActive(null); activeRef.current = null; }
    const { [id]: _, ...rest } = mapRef.current;
    updateMap(rest);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput('');

    // optimistic
    const chat  = mapRef.current[active]; if (!chat) return;
    const tmpId = Date.now();
    updateMap({ ...mapRef.current, [active]: { ...chat, messages: [...chat.messages, { id: tmpId, text, time: new Date().toISOString(), from: 'me' }] } });
    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus(); }, 50);

    // real send
    const res = await tgSendMessage(active, text);
    if (res?.ok && res.result?.message_id) {
      const cur  = mapRef.current[active];
      const msgs = cur.messages.map((m) => m.id === tmpId ? { ...m, id: res.result.message_id } : m);
      updateMap({ ...mapRef.current, [active]: { ...cur, messages: msgs } });
    }
  };

  /* ── derived lists ── */
  const chats = useMemo(() => {
    const q = search.toLowerCase();
    return Object.values(chatsMap).filter((c) =>
      c.name.toLowerCase().includes(q) || String(c.phone).toLowerCase().includes(q)
    );
  }, [chatsMap, search]);

  const favorites  = chats.filter((c) => c.favorite);
  const others     = chats.filter((c) => !c.favorite);
  const activeChat = active ? chatsMap[active] : null;

  /* ── render ── */
  return (
    <>
      {notifHolder}
      <div style={{ display: 'flex', height: 'calc(100vh - 230px)', minHeight: 440 }}>

        {/* ── Left: chat list ── */}
        <div style={{ width: 280, borderRight: '1px solid #ffe4ea', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Status bar */}
          <div style={{
            padding: '5px 14px',
            borderBottom: '1px solid #f0f0f0',
            background: status === 'live' ? '#f6ffed' : status === 'error' ? '#fff2f0' : '#fffbe6',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: status === 'live' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#faad14',
              animation: status === 'connecting' ? 'pulse 1.2s infinite' : 'none',
            }} />
            <span style={{ fontWeight: 600, color: status === 'live' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#faad14', flex: 1 }}>
              {status === 'live' ? 'Онлайн · @teamcrmbot' : status === 'error' ? 'Ошибка подключения' : 'Подключение...'}
            </span>
            <Tooltip title="Сбросить webhook и переподключиться">
              <button
                onClick={reconnect}
                style={{
                  background: 'none', border: '1px solid #d4edf9', borderRadius: 8,
                  cursor: 'pointer', fontSize: 10, fontWeight: 700, color: ACCENT,
                  padding: '2px 7px', lineHeight: 1.6, whiteSpace: 'nowrap',
                }}
              >
                Переподключить
              </button>
            </Tooltip>
          </div>

          {/* Search */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #ffe4ea' }}>
            <Input
              prefix={<SearchOutlined style={{ color: ACCENT }} />}
              placeholder="Поиск..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: 14, borderColor: '#d4edf9', fontSize: 13 }} size="small"
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ccc' }}>
                <SendOutlined style={{ fontSize: 34, marginBottom: 10, display: 'block', color: '#d4edf9' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>Нет диалогов</div>
                <div style={{ fontSize: 11, marginTop: 6, color: '#ddd', lineHeight: 1.5 }}>
                  Напишите боту <b style={{ color: ACCENT }}>@teamcrmbot</b> в Telegram — сообщение появится здесь
                </div>
              </div>
            )}

            {favorites.length > 0 && (
              <>
                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 0.8, textTransform: 'uppercase' }}>Избранные</div>
                {favorites.map((c) => <ChatItem key={c.id} chat={c} active={active} hovered={hovered} setHovered={setHovered} onSelect={selectChat} onFavorite={toggleFavorite} onRead={markRead} onDelete={deleteChat} accentColor={ACCENT} />)}
                {others.length > 0 && <Divider style={{ margin: '6px 0', borderColor: '#d4edf9' }} />}
              </>
            )}
            {favorites.length > 0 && others.length > 0 && (
              <div style={{ padding: '2px 14px 4px', fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: 0.8, textTransform: 'uppercase' }}>Все чаты</div>
            )}
            {others.map((c) => <ChatItem key={c.id} chat={c} active={active} hovered={hovered} setHovered={setHovered} onSelect={selectChat} onFavorite={toggleFavorite} onRead={markRead} onDelete={deleteChat} accentColor={ACCENT} />)}
          </div>
        </div>

        {/* ── Right: messages ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #ffe4ea', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <Avatar size={38} icon={<UserOutlined />} style={{ background: `linear-gradient(135deg, ${ACCENT}88, ${ACCENT})`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{activeChat.name}</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>{activeChat.phone}</div>
                </div>
                <Tooltip title={activeChat.favorite ? 'Убрать из избранного' : 'В избранное'}>
                  <Button type="text" size="small"
                    icon={activeChat.favorite ? <StarFilled style={{ color: ACCENT }} /> : <StarOutlined style={{ color: '#ccc' }} />}
                    onClick={(e) => toggleFavorite(activeChat.id, e)}
                  />
                </Tooltip>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeChat.messages.map((msg) => {
                  const own = msg.from === 'me';
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        background:   own ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` : 'rgba(255,255,255,0.95)',
                        color:        own ? '#fff' : '#1a1a1a',
                        border:       own ? 'none' : `1px solid #d4edf9`,
                        borderRadius: own ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        padding: '10px 14px', fontSize: 14, lineHeight: 1.55,
                        boxShadow: own ? `0 4px 12px ${ACCENT}44` : '0 1px 4px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                      <Text style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>{dayjs(msg.time).format('HH:mm')}</Text>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #ffe4ea', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Input
                  ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={sendMessage}
                  placeholder="Написать сообщение..."
                  style={{ borderRadius: 22, borderColor: '#d4edf9', flex: 1, height: 40 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} disabled={!input.trim()}
                  style={{ borderRadius: 22, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, border: 'none', width: 44, height: 40, flexShrink: 0 }}
                />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
              <SendOutlined style={{ fontSize: 56, marginBottom: 16, color: '#d4edf9' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb' }}>Выберите чат</div>
              <div style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Нажмите на контакт слева</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── WhatsAppMessenger (real Green API polling) ──────────────────────────────
const WhatsAppMessenger = ({ pendingChatId, onChatOpened }) => {
  const dispatch  = useDispatch();
  const mapRef    = useRef(loadWaReal());
  const [chatsMap, setChatsMap] = useState(mapRef.current);
  const [active,   setActive]   = useState(null);
  const [search,   setSearch]   = useState('');
  const [input,    setInput]    = useState('');
  const [hovered,  setHovered]  = useState(null);
  const [status,   setStatus]   = useState('connecting'); // 'connecting' | 'live' | 'error'
  const activeRef  = useRef(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const [notifApi, notifHolder] = notification.useNotification();

  const ACCENT = '#25D366';

  /* ── helpers ── */
  const updateMap = useCallback((next) => {
    mapRef.current = next;
    saveWaReal(next);
    setChatsMap(next);
  }, []);

  useEffect(() => { activeRef.current = active; }, [active]);

  const reconnect = useCallback(async () => {
    setStatus('connecting');
    const res = await waGetStateInstance();
    setTimeout(() => setStatus(res?.stateInstance === 'authorized' ? 'live' : 'error'), 800);
  }, []);

  /* ── polling (Green API long-polling queue) ── */
  useEffect(() => {
    let timer;
    let alive = true;

    const poll = async () => {
      if (!alive) return;
      try {
        const res = await waReceiveNotification();
        if (!alive) return;

        if (res?.receiptId) {
          const body = res.body || {};

          if (body.typeWebhook === 'incomingMessageReceived') {
            const senderData = body.senderData || {};
            const messageData = body.messageData || {};
            const chatId = senderData.chatId;
            const text = messageData.textMessageData?.textMessage
                      || messageData.extendedTextMessageData?.text;

            if (chatId && text && !chatId.endsWith('@g.us')) {
              const name      = senderData.senderName || senderData.chatName || chatId.split('@')[0];
              const phone     = chatId.split('@')[0];
              const isActive  = activeRef.current === chatId;
              const map       = { ...mapRef.current };
              const prev      = map[chatId] || { id: chatId, name, phone, favorite: false, unread: 0, messages: [] };

              if (!prev.messages.some((m) => m.id === body.idMessage)) {
                map[chatId] = {
                  ...prev, name, phone,
                  unread:   isActive ? 0 : prev.unread + 1,
                  messages: [...prev.messages, {
                    id:   body.idMessage,
                    text,
                    time: new Date((body.timestamp || Date.now() / 1000) * 1000).toISOString(),
                    from: 'them',
                  }],
                };
                updateMap(map);

                if (!isActive) {
                  dispatch(addNotification({
                    source: 'whatsapp', from: name, text, chatId,
                    time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                  }));
                  notifApi.open({
                    message: (
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        <WhatsAppOutlined style={{ color: ACCENT, marginRight: 8 }} />{name}
                      </span>
                    ),
                    description: (
                      <div>
                        <div style={{ color: '#444', marginBottom: 6 }}>{text}</div>
                        <div style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>Нажмите, чтобы открыть чат →</div>
                      </div>
                    ),
                    placement: 'topRight',
                    duration: 6,
                    onClick: () => window.dispatchEvent(new CustomEvent('crm-open-chat', { detail: { tab: 'whatsapp', chatId } })),
                    style: { borderRadius: 16, border: '1px solid #d6f5e3', background: '#f0fff5', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', cursor: 'pointer' },
                    icon: <WhatsAppOutlined style={{ color: ACCENT, fontSize: 22 }} />,
                  });
                }
              }
            }
          }

          await waDeleteNotification(res.receiptId);
          setStatus('live');
          timer = setTimeout(poll, 300);
        } else {
          setStatus('live');
          timer = setTimeout(poll, 1000);
        }
      } catch {
        setStatus('error');
        timer = setTimeout(poll, 5000);
      }
    };

    poll();
    return () => { alive = false; clearTimeout(timer); };
  }, [updateMap, dispatch, notifApi]);

  /* ── open chat from notification ── */
  useEffect(() => {
    if (!pendingChatId) return;
    const target = mapRef.current[pendingChatId];
    if (target) {
      setActive(pendingChatId);
      activeRef.current = pendingChatId;
      updateMap({ ...mapRef.current, [pendingChatId]: { ...target, unread: 0 } });
    }
    onChatOpened?.();
  }, [pendingChatId]); // eslint-disable-line

  /* ── scroll to bottom on chat change ── */
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'instant' }); }, [active]);
  const activeMsgsLen = chatsMap[active]?.messages?.length;
  useEffect(() => {
    if (activeMsgsLen) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
  }, [activeMsgsLen]);

  /* ── actions ── */
  const selectChat = (chat) => {
    setActive(chat.id);
    activeRef.current = chat.id;
    updateMap({ ...mapRef.current, [chat.id]: { ...mapRef.current[chat.id], unread: 0 } });
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    const c = mapRef.current[id]; if (!c) return;
    updateMap({ ...mapRef.current, [id]: { ...c, favorite: !c.favorite } });
  };

  const markRead = (id, e) => {
    e.stopPropagation();
    const c = mapRef.current[id]; if (!c) return;
    updateMap({ ...mapRef.current, [id]: { ...c, unread: 0 } });
  };

  const deleteChat = (id, e) => {
    e.stopPropagation();
    if (active === id) { setActive(null); activeRef.current = null; }
    const { [id]: _, ...rest } = mapRef.current;
    updateMap(rest);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !active) return;
    setInput('');

    // optimistic
    const chat  = mapRef.current[active]; if (!chat) return;
    const tmpId = Date.now();
    updateMap({ ...mapRef.current, [active]: { ...chat, messages: [...chat.messages, { id: tmpId, text, time: new Date().toISOString(), from: 'me' }] } });
    setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); inputRef.current?.focus(); }, 50);

    // real send
    const res = await waSendMessage(active, text);
    if (res?.idMessage) {
      const cur  = mapRef.current[active];
      const msgs = cur.messages.map((m) => m.id === tmpId ? { ...m, id: res.idMessage } : m);
      updateMap({ ...mapRef.current, [active]: { ...cur, messages: msgs } });
    }
  };

  /* ── derived lists ── */
  const chats = useMemo(() => {
    const q = search.toLowerCase();
    return Object.values(chatsMap).filter((c) =>
      c.name.toLowerCase().includes(q) || String(c.phone).toLowerCase().includes(q)
    );
  }, [chatsMap, search]);

  const favorites  = chats.filter((c) => c.favorite);
  const others     = chats.filter((c) => !c.favorite);
  const activeChat = active ? chatsMap[active] : null;

  /* ── render ── */
  return (
    <>
      {notifHolder}
      <div style={{ display: 'flex', height: 'calc(100vh - 230px)', minHeight: 440 }}>

        {/* ── Left: chat list ── */}
        <div style={{ width: 280, borderRight: '1px solid #ffe4ea', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Status bar */}
          <div style={{
            padding: '5px 14px',
            borderBottom: '1px solid #f0f0f0',
            background: status === 'live' ? '#f6ffed' : status === 'error' ? '#fff2f0' : '#fffbe6',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: status === 'live' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#faad14',
              animation: status === 'connecting' ? 'pulse 1.2s infinite' : 'none',
            }} />
            <span style={{ fontWeight: 600, color: status === 'live' ? '#52c41a' : status === 'error' ? '#ff4d4f' : '#faad14', flex: 1 }}>
              {status === 'live' ? 'Онлайн · Green API' : status === 'error' ? 'Ошибка подключения' : 'Подключение...'}
            </span>
            <Tooltip title="Проверить статус подключения">
              <button
                onClick={reconnect}
                style={{
                  background: 'none', border: '1px solid #d6f5e3', borderRadius: 8,
                  cursor: 'pointer', fontSize: 10, fontWeight: 700, color: ACCENT,
                  padding: '2px 7px', lineHeight: 1.6, whiteSpace: 'nowrap',
                }}
              >
                Переподключить
              </button>
            </Tooltip>
          </div>

          {/* Search */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #ffe4ea' }}>
            <Input
              prefix={<SearchOutlined style={{ color: ACCENT }} />}
              placeholder="Поиск..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ borderRadius: 14, borderColor: '#d6f5e3', fontSize: 13 }} size="small"
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chats.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ccc' }}>
                <WhatsAppOutlined style={{ fontSize: 34, marginBottom: 10, display: 'block', color: '#d6f5e3' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#bbb' }}>Нет диалогов</div>
                <div style={{ fontSize: 11, marginTop: 6, color: '#ddd', lineHeight: 1.5 }}>
                  Напишите на номер WhatsApp, подключённый к Green API — сообщение появится здесь
                </div>
              </div>
            )}

            {favorites.length > 0 && (
              <>
                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 0.8, textTransform: 'uppercase' }}>Избранные</div>
                {favorites.map((c) => <ChatItem key={c.id} chat={c} active={active} hovered={hovered} setHovered={setHovered} onSelect={selectChat} onFavorite={toggleFavorite} onRead={markRead} onDelete={deleteChat} accentColor={ACCENT} />)}
                {others.length > 0 && <Divider style={{ margin: '6px 0', borderColor: '#d6f5e3' }} />}
              </>
            )}
            {favorites.length > 0 && others.length > 0 && (
              <div style={{ padding: '2px 14px 4px', fontSize: 11, fontWeight: 700, color: '#bbb', letterSpacing: 0.8, textTransform: 'uppercase' }}>Все чаты</div>
            )}
            {others.map((c) => <ChatItem key={c.id} chat={c} active={active} hovered={hovered} setHovered={setHovered} onSelect={selectChat} onFavorite={toggleFavorite} onRead={markRead} onDelete={deleteChat} accentColor={ACCENT} />)}
          </div>
        </div>

        {/* ── Right: messages ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {activeChat ? (
            <>
              {/* Header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #ffe4ea', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                <Avatar size={38} icon={<UserOutlined />} style={{ background: `linear-gradient(135deg, ${ACCENT}88, ${ACCENT})`, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{activeChat.name}</div>
                  <div style={{ fontSize: 12, color: '#bbb' }}>{activeChat.phone}</div>
                </div>
                <Tooltip title={activeChat.favorite ? 'Убрать из избранного' : 'В избранное'}>
                  <Button type="text" size="small"
                    icon={activeChat.favorite ? <StarFilled style={{ color: ACCENT }} /> : <StarOutlined style={{ color: '#ccc' }} />}
                    onClick={(e) => toggleFavorite(activeChat.id, e)}
                  />
                </Tooltip>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeChat.messages.map((msg) => {
                  const own = msg.from === 'me';
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%',
                        background:   own ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)` : 'rgba(255,255,255,0.95)',
                        color:        own ? '#fff' : '#1a1a1a',
                        border:       own ? 'none' : `1px solid #d6f5e3`,
                        borderRadius: own ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        padding: '10px 14px', fontSize: 14, lineHeight: 1.55,
                        boxShadow: own ? `0 4px 12px ${ACCENT}44` : '0 1px 4px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word',
                      }}>
                        {msg.text}
                      </div>
                      <Text style={{ fontSize: 11, color: '#ccc', marginTop: 3 }}>{dayjs(msg.time).format('HH:mm')}</Text>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #ffe4ea', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <Input
                  ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPressEnter={sendMessage}
                  placeholder="Написать сообщение..."
                  style={{ borderRadius: 22, borderColor: '#d6f5e3', flex: 1, height: 40 }}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} disabled={!input.trim()}
                  style={{ borderRadius: 22, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}cc)`, border: 'none', width: 44, height: 40, flexShrink: 0 }}
                />
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
              <WhatsAppOutlined style={{ fontSize: 56, marginBottom: 16, color: '#d6f5e3' }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: '#bbb' }}>Выберите чат</div>
              <div style={{ fontSize: 13, color: '#ccc', marginTop: 6 }}>Нажмите на контакт слева</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ─── ChatItem ─────────────────────────────────────────────────────────────────
const ChatItem = ({ chat, active, hovered, setHovered, onSelect, onFavorite, onRead, onDelete, accentColor }) => {
  const isActive  = active === chat.id;
  const isHovered = hovered === chat.id;
  const last = chat.messages[chat.messages.length - 1];

  return (
    <div
      onMouseEnter={() => setHovered(chat.id)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onSelect(chat)}
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        background: isActive ? '#fff5f7' : isHovered ? '#fff9fb' : 'transparent',
        borderLeft: isActive ? '3px solid #FFB7C5' : '3px solid transparent',
        transition: 'background 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Avatar + unread badge */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar size={40} icon={<UserOutlined />} style={{ background: `linear-gradient(135deg, ${accentColor}66, ${accentColor}99)` }} />
        {chat.unread > 0 && (
          <div style={{ position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, background: '#ff4d4f', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '1.5px solid #fff' }}>
            {chat.unread}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: chat.unread > 0 ? 700 : 600, fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
            {chat.favorite && <StarFilled style={{ fontSize: 10, color: '#FFB7C5', marginRight: 4 }} />}
            {chat.name}
          </span>
          <span style={{ fontSize: 11, color: '#ccc', flexShrink: 0, marginLeft: 4 }}>
            {last ? (dayjs(last.time).format('HH:mm')) : ''}
          </span>
        </div>
        <div style={{ fontSize: 12, color: chat.unread > 0 ? '#888' : '#bbb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: chat.unread > 0 ? 500 : 400, marginTop: 1 }}>
          {last ? (last.from === 'me' ? `Вы: ${last.text}` : last.text) : '—'}
        </div>
      </div>

      {/* Hover actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.12 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={chat.favorite ? 'Убрать из избранного' : 'В избранное'} placement="right">
              <button onClick={(e) => onFavorite(chat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1, color: chat.favorite ? '#FFB7C5' : '#ccc', fontSize: 13 }}>
                {chat.favorite ? <StarFilled /> : <StarOutlined />}
              </button>
            </Tooltip>
            {chat.unread > 0 && (
              <Tooltip title="Отметить прочитанным" placement="right">
                <button onClick={(e) => onRead(chat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1, color: '#52c41a', fontSize: 13 }}>
                  <CheckOutlined />
                </button>
              </Tooltip>
            )}
            <Tooltip title="Удалить чат" placement="right">
              <button onClick={(e) => onDelete(chat.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1, color: '#ffaaa0', fontSize: 13 }}>
                <DeleteOutlined />
              </button>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ChatsPage = () => {
  const { user }   = useSelector((s) => s.auth);
  const location   = useLocation();

  const [activeTab,    setActiveTab]    = useState(location.state?.tab    || 'employees');
  const [pendingChatId, setPendingChatId] = useState(location.state?.chatId || null);

  // Listen for crm-open-chat events (when user is already on /chats)
  useEffect(() => {
    const handler = (e) => {
      setActiveTab(e.detail.tab);
      setPendingChatId(e.detail.chatId);
    };
    window.addEventListener('crm-open-chat', handler);
    return () => window.removeEventListener('crm-open-chat', handler);
  }, []);

  const handleChatOpened = useCallback(() => setPendingChatId(null), []);

  return (
    <div style={{ padding: '28px 32px' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Title level={3} style={{ marginBottom: 24 }}>✉ Чаты</Title>

        <Card className="sakura-card" bodyStyle={{ padding: 0, overflow: 'hidden' }} style={{ borderRadius: 20 }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarStyle={{ padding: '0 24px', margin: 0, borderBottom: '1px solid #ffe4ea' }}
            items={[
              {
                key: 'employees',
                label: <span style={{ fontWeight: 600 }}><MessageOutlined style={{ marginRight: 6, color: '#FFB7C5' }} />Сотрудники</span>,
                children: <EmployeeChat user={user} />,
              },
              {
                key: 'whatsapp',
                label: <span style={{ fontWeight: 600 }}><WhatsAppOutlined style={{ marginRight: 6, color: '#25D366' }} />WhatsApp</span>,
                children: (
                  <WhatsAppMessenger
                    pendingChatId={activeTab === 'whatsapp' ? pendingChatId : null}
                    onChatOpened={handleChatOpened}
                  />
                ),
              },
              {
                key: 'telegram',
                label: <span style={{ fontWeight: 600 }}><SendOutlined style={{ marginRight: 6, color: '#229ED9' }} />Telegram</span>,
                children: (
                  <TelegramMessenger
                    pendingChatId={activeTab === 'telegram' ? pendingChatId : null}
                    onChatOpened={handleChatOpened}
                  />
                ),
              },
            ]}
          />
        </Card>
      </motion.div>
    </div>
  );
};

export default ChatsPage;
