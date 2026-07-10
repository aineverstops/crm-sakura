// Контроллер авторизации. Отвечает за вход в систему: проверку пароля и выдачу JWT-токена.
const bcrypt = require('bcryptjs');     // библиотека для хеширования и проверки паролей
const jwt = require('jsonwebtoken');    // библиотека для создания JWT-токенов
const { User } = require('../models');

// Вход в систему
const login = async (req, res) => {
  try {
    const { username, password } = req.body; // логин и пароль из формы входа

    // Ищем пользователя по логину
    const user = await User.findOne({ where: { username } });
    if (!user) {
      // Пользователь не найден — намеренно не уточняем, что именно неверно (безопасность)
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Сравниваем введённый пароль с хешем из базы.
    // bcrypt.compare заново хеширует пароль и сверяет — расшифровать хеш нельзя.
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Пароль верный — создаём JWT-токен (электронный пропуск).
    // В него «зашиваем» id, логин и роль; подпись делается секретным ключом из .env.
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, // полезные данные (payload)
      process.env.JWT_SECRET,                                    // секретный ключ подписи
      { expiresIn: process.env.JWT_EXPIRES_IN }                  // срок действия токена
    );

    // Отмечаем, что первый вход уже совершён (для обучающего тура)
    const isFirstLogin = user.isFirstLogin;
    if (user.isFirstLogin) {
      await user.update({ isFirstLogin: false });
    }

    // Возвращаем токен и данные пользователя (без пароля!)
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
      },
      isFirstLogin,
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

// Получить данные текущего пользователя (по токену). req.user заполняет middleware авторизации.
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }, // НИКОГДА не отдаём хеш пароля на клиент
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = { login, getMe };
