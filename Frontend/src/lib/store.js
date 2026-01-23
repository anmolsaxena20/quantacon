import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    addNotification: (notification) => {
        const newNotification = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            read: false,
            timestamp: Date.now(),
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications],
        }));
    },
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),
    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
    clearAll: () => set({ notifications: [] }),
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
