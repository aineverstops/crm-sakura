import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    addNotification(state, action) {
      state.items.unshift({ ...action.payload, id: Date.now(), read: false });
      state.unreadCount += 1;
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },
    removeNotification(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
  },
});

export const { addNotification, markAllRead, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
