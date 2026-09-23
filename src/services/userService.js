// ============================================================
// USER SERVICE
// ============================================================
import { storageService } from './storageService.js';
import { DEMO_USERS } from '../data/demoData.js';

const KEY = 'users';

export const userService = {
  getAll() {
    return storageService.get(KEY) || DEMO_USERS;
  },

  getById(id) {
    return this.getAll().find(u => u.id === id) || null;
  },

  getByRole(role) {
    return this.getAll().filter(u => u.role === role);
  },
};
