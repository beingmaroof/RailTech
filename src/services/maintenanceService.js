// ============================================================
// MAINTENANCE SERVICE
// ============================================================
import { storageService } from './storageService.js';
import { INITIAL_MAINTENANCE_REQUESTS } from '../data/demoData.js';

const KEY = 'maintenance_requests';

function seed() {
  if (!storageService.has(KEY)) {
    storageService.set(KEY, INITIAL_MAINTENANCE_REQUESTS);
  }
}

export const maintenanceService = {
  init() { seed(); },

  getAll() {
    seed();
    return storageService.get(KEY) || [];
  },

  getById(id) {
    return this.getAll().find(r => r.id === id) || null;
  },

  getByDepartment(dept) {
    return this.getAll().filter(r => r.department === dept);
  },

  create(data) {
    const all = this.getAll();
    const deptPrefix = data.department === 'Engineering' ? 'ENG'
      : data.department === 'Signal & Telecom' ? 'SNT' : 'TRD';
    const existing = all.filter(r => r.id.startsWith(deptPrefix + '-REQ-'));
    const nextNum = (existing.length + 1).toString().padStart(3, '0');
    const newReq = {
      ...data,
      id: `${deptPrefix}-REQ-${nextNum}`,
      requestNo: all.length + 1,
      status: 'Pending AI Review',
      aiRecommendation: null,
      conflictStatus: 'No Conflict',
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
    };
    all.push(newReq);
    storageService.set(KEY, all);
    return newReq;
  },

  update(id, updates) {
    const all = this.getAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    storageService.set(KEY, all);
    return all[idx];
  },

  startWork(id, employeeId) {
    return this.update(id, {
      status: 'In Progress',
      startedAt: new Date().toISOString(),
      assignedEmployee: employeeId,
    });
  },

  endWork(id) {
    return this.update(id, {
      status: 'Completed',
      completedAt: new Date().toISOString(),
    });
  },

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      critical: all.filter(r => r.priority === 'Critical').length,
      high: all.filter(r => r.priority === 'High').length,
      pending: all.filter(r => r.status === 'Pending AI Review').length,
      scheduled: all.filter(r => r.status === 'Scheduled').length,
      inProgress: all.filter(r => r.status === 'In Progress').length,
      completed: all.filter(r => r.status === 'Completed').length,
    };
  },
};
