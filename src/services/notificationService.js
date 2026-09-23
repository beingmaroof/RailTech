// ============================================================
// NOTIFICATION SERVICE
// ============================================================
import { storageService } from './storageService.js';

const KEY = 'notifications';
let listeners = [];

export const notificationService = {
  getAll() {
    return storageService.get(KEY) || [];
  },

  add(notification) {
    const all = this.getAll();
    const n = {
      id: `NOTIF-${Date.now()}`,
      type: 'info', // info | success | warning | critical
      message: '',
      time: new Date().toISOString(),
      read: false,
      ...notification,
    };
    all.unshift(n);
    storageService.set(KEY, all.slice(0, 50)); // keep last 50
    listeners.forEach(fn => fn(n));
    return n;
  },

  markRead(id) {
    const all = this.getAll();
    const idx = all.findIndex(n => n.id === id);
    if (idx >= 0) {
      all[idx].read = true;
      storageService.set(KEY, all);
    }
  },

  markAllRead() {
    const all = this.getAll().map(n => ({ ...n, read: true }));
    storageService.set(KEY, all);
  },

  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length;
  },

  subscribe(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  },
};
