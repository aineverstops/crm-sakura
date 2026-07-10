// Redux-срез для авторизации: хранит данные пользователя и токен в глобальном состоянии.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Асинхронное действие «вход»: отправляет логин/пароль на сервер.
// createAsyncThunk автоматически создаёт состояния pending/fulfilled/rejected.
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token); // сохраняем токен в браузере (переживёт перезагрузку)
    return data;
  } catch (err) {
    // Возвращаем текст ошибки, чтобы показать пользователю
    return rejectWithValue(err.response?.data?.message || 'Ошибка входа');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'), // при запуске берём токен из localStorage
    isFirstLogin: false,
    loading: false,
    error: null,
  },
  reducers: {
    // Выход: очищаем пользователя, токен и удаляем его из localStorage
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    // Записать данные пользователя (например, после запроса /auth/me)
    setUser(state, action) {
      state.user = action.payload;
    },
    clearFirstLogin(state) {
      state.isFirstLogin = false;
    },
  },
  // Реакция на состояния асинхронного входа
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {     // запрос отправлен — показываем загрузку
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => { // успех — сохраняем пользователя и токен
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isFirstLogin = action.payload.isFirstLogin;
      })
      .addCase(login.rejected, (state, action) => {  // ошибка — показываем сообщение
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, setUser, clearFirstLogin } = authSlice.actions;
export default authSlice.reducer;
