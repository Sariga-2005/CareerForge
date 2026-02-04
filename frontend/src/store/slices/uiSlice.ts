import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modalOpen: {
    type: string | null;
    data?: any;
  };
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  isOnline: boolean;
  isMobile: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
  modalOpen: { type: null },
  notifications: [],
  isOnline: navigator.onLine,
  isMobile: window.innerWidth < 768,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.modalOpen = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = { type: null };
    },
    addNotification: (
      state,
      action: PayloadAction<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
      }>
    ) => {
      state.notifications.unshift({
        ...action.payload,
        read: false,
        createdAt: new Date().toISOString(),
      });
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  openModal,
  closeModal,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
  setOnlineStatus,
  setIsMobile,
} = uiSlice.actions;

export default uiSlice.reducer;
