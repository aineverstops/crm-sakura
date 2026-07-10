# 🌸 CRM Sakura — Система управления бизнесом

> Дипломная работа: «Разработка CRM-системы с модулем складского учёта для малого бизнеса»  
> Автор: Батталов Тимур Серикжанович  
> КАТИУ им. С. Сейфуллина, 2026 г.

---

## Технологический стек

| Уровень   | Технология                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Redux Toolkit, Ant Design 5, Recharts, Framer Motion |
| Backend   | Node.js, Express.js, Sequelize ORM  |
| База данных | PostgreSQL 15                     |
| Авторизация | JWT (JSON Web Tokens)             |
| Архитектура | MVC, REST API, SPA                |

---

## Необходимые программы

| Программа     | Версия   | Ссылка                                 |
|---------------|----------|----------------------------------------|
| Node.js       | 18+      | https://nodejs.org                     |
| PostgreSQL     | 15+      | https://www.postgresql.org             |
| VS Code       | любая    | https://code.visualstudio.com          |
| Git (опционально) | любая | https://git-scm.com                   |

---

## Структура проекта

```
GGCRM/
├── backend/
│   ├── config/
│   │   └── database.js          — подключение к PostgreSQL через Sequelize
│   ├── controllers/
│   │   ├── authController.js    — вход, получение профиля
│   │   ├── clientController.js  — CRUD клиентов
│   │   ├── dealController.js    — CRUD сделок (Kanban)
│   │   ├── taskController.js    — CRUD задач
│   │   ├── leadController.js    — CRUD лидов + конвертация
│   │   ├── warehouseController.js — товары, движение остатков
│   │   ├── invoiceController.js — создание накладных (атомарно)
│   │   └── analyticsController.js — сводная аналитика
│   ├── middleware/
│   │   └── authMiddleware.js    — проверка JWT
│   ├── models/
│   │   ├── User.js              — пользователи (admin/manager)
│   │   ├── Client.js            — клиенты
│   │   ├── Deal.js              — сделки
│   │   ├── Task.js              — задачи
│   │   ├── Lead.js              — лиды
│   │   ├── Product.js           — товары на складе
│   │   ├── Invoice.js           — накладные
│   │   └── InvoiceItem.js       — позиции накладной
│   ├── routes/                  — REST-маршруты (по контроллерам)
│   ├── app.js                   — точка входа, sync БД, seed-пользователь
│   ├── package.json
│   └── .env                     — переменные окружения
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── SakuraPetals.jsx     — анимация падающих лепестков (Canvas)
        │   ├── OnboardingTour.jsx   — приветственное окно + тур по разделам
        │   └── NotificationPopup.jsx — демо-уведомления WhatsApp/Telegram
        ├── pages/
        │   ├── LoginPage.jsx        — страница входа (тема Sakura)
        │   ├── DashboardPage.jsx    — дашборд (карточки + Recharts)
        │   ├── ClientsPage.jsx      — таблица клиентов с поиском
        │   ├── ClientProfilePage.jsx — профиль клиента (сделки, задачи)
        │   ├── DealsPage.jsx        — Kanban-доска (drag & drop)
        │   ├── TasksPage.jsx        — список задач с дедлайнами
        │   ├── LeadsPage.jsx        — лиды + конвертация в клиентов
        │   ├── AnalyticsPage.jsx    — графики и статистика
        │   ├── CalendarPage.jsx     — планирование событий
        │   ├── WarehousePage.jsx    — склад + накладные PDF
        │   ├── EmployeesPage.jsx    — управление ролями
        │   └── SettingsPage.jsx     — настройки и интеграции
        ├── store/
        │   ├── index.js             — Redux store
        │   ├── authSlice.js         — авторизация
        │   └── notificationsSlice.js — уведомления
        ├── services/
        │   └── api.js               — axios с JWT-интерцептором
        ├── utils/
        │   └── pdfInvoice.js        — генерация HTML-накладной в новой вкладке
        ├── App.jsx                  — ConfigProvider (тема Sakura) + маршрутизация
        └── index.css                — глобальные стили
```

---

## Запуск проекта

### Шаг 1 — Настройка базы данных PostgreSQL

1. Установите PostgreSQL и запустите сервис.
2. Создайте базу данных:
```sql
CREATE DATABASE crm_sakura;
```
3. Убедитесь, что пользователь `postgres` с паролем `postgres` существует (или измените `.env`).

### Шаг 2 — Настройка Backend

```bash
cd GGCRM/backend
npm install
```

Откройте `backend/.env` и при необходимости измените параметры:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_sakura
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=sakura_crm_secret_key_2026
```

Запустите сервер:
```bash
npm run dev    # режим разработки (nodemon)
# или
npm start      # обычный запуск
```

При первом запуске Sequelize автоматически создаст таблицы и добавит пользователя-администратора:
- **Логин:** `timur`
- **Пароль:** `12345678`

### Шаг 3 — Настройка Frontend

```bash
cd GGCRM/frontend
npm install
npm start
```

Приложение откроется на `http://localhost:3000`

---

## Данные для входа

| Поле    | Значение   |
|---------|------------|
| Логин   | `timur`    |
| Пароль  | `12345678` |

---

## Функциональность системы

| Раздел       | Функции                                                                 |
|--------------|-------------------------------------------------------------------------|
| Дашборд      | Статистика клиентов, сделок, задач; графики выручки (Recharts)         |
| Клиенты      | Поиск, CRUD, профиль клиента с историей сделок и задач                 |
| Сделки       | Kanban-доска (drag & drop по статусам: Новая / В работе / Закрыта)     |
| Задачи       | Список с дедлайнами, приоритетами, быстрое закрытие задачи             |
| Лиды         | Учёт потенциальных клиентов, конвертация лида в клиента                |
| Аналитика    | Выручка по месяцам, сделки по статусам (AreaChart, PieChart, BarChart) |
| Календарь    | Планирование звонков и встреч, хранение в localStorage                 |
| Склад        | Товары, штрихкоды, движение остатков, приходные/расходные накладные    |
| Накладные    | Создание с атомарным списанием остатков, открытие в новой вкладке      |
| Сотрудники   | Управление ролями (Администратор / Менеджер)                           |
| Настройки    | Параметры компании, уведомления, форма интеграций                      |

---

## Интеграции (требуют API-ключей)

### WhatsApp Business API

Для реальной интеграции с WhatsApp необходим аккаунт Meta Business:

1. Зарегистрируйтесь на [developers.facebook.com](https://developers.facebook.com)
2. Создайте приложение типа «Business»
3. Подключите WhatsApp Business API
4. Скопируйте `Access Token` и номер телефона
5. Вставьте в `backend/.env`:
```
WHATSAPP_TOKEN=ваш_токен
WHATSAPP_PHONE_ID=номер_телефона_id
```
6. В `backend/` создайте сервис `services/whatsapp.js` с отправкой через `https://graph.facebook.com/v18.0/{phone-id}/messages`

### Telegram Bot

1. Откройте @BotFather в Telegram
2. Выполните `/newbot`, получите Bot Token
3. Добавьте в `backend/.env`:
```
TELEGRAM_BOT_TOKEN=ваш_bot_token
TELEGRAM_CHAT_ID=id_чата
```
4. Установите библиотеку: `npm install node-telegram-bot-api`
5. Инициализируйте бота в `backend/services/telegram.js`

> **Текущий режим:** В настоящей версии уведомления WhatsApp/Telegram реализованы как **демо-симуляция** — всплывающие уведомления появляются через случайные интервалы (15–40 сек) с тестовыми сообщениями и звуком. Это демонстрирует UI без необходимости реальных API-ключей.

---

## Доработка модулей

### Добавление нового раздела

1. Создайте контроллер в `backend/controllers/`
2. Создайте маршруты в `backend/routes/`
3. Подключите маршруты в `backend/app.js`
4. Создайте страницу в `frontend/src/pages/`
5. Добавьте пункт в `NAV_ITEMS` массив в `frontend/src/App.jsx`
6. Добавьте `<Route>` в блок маршрутов

### Изменение цветовой темы

Откройте `frontend/src/App.jsx`, найдите объект `sakuraTheme` и измените:
- `colorPrimary` — основной акцентный цвет
- `colorFillAlter` / `colorFillContent` — фоновый цвет элементов

---

## Переменные окружения

| Переменная       | Описание                        | По умолчанию           |
|------------------|---------------------------------|------------------------|
| `PORT`           | Порт сервера                    | `5000`                 |
| `DB_HOST`        | Хост PostgreSQL                 | `localhost`            |
| `DB_PORT`        | Порт PostgreSQL                 | `5432`                 |
| `DB_NAME`        | Имя базы данных                 | `crm_sakura`           |
| `DB_USER`        | Пользователь БД                 | `postgres`             |
| `DB_PASSWORD`    | Пароль БД                       | `postgres`             |
| `JWT_SECRET`     | Секрет для подписи JWT          | (установите свой!)     |
| `JWT_EXPIRES_IN` | Время жизни токена              | `7d`                   |

---

*© 2026 Батталов Тимур · КАТИУ им. С. Сейфуллина · Дипломная работа*
