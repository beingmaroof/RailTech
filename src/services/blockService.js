// ============================================================
// BLOCK SERVICE
// ============================================================
import { storageService } from './storageService.js';
import { BLOCK_WINDOWS } from '../data/demoData.js';

const KEY = 'block_windows';
const PLANS_KEY = 'ai_plans';

function seed() {
  if (!storageService.has(KEY)) {
    storageService.set(KEY, BLOCK_WINDOWS);
  }
}

export const blockService = {
  init() { seed(); },

  getAll() {
    seed();
    return storageService.get(KEY) || [];
  },

  getByCorridor(corridor) {
    return this.getAll().filter(b => b.corridor === corridor);
  },

  getAvailable() {
    return this.getAll().filter(b => b.status === 'Available');
  },

  update(id, updates) {
    const all = this.getAll();
    const idx = all.findIndex(b => b.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    storageService.set(KEY, all);
    return all[idx];
  },

  // AI Plans
  getPlans() {
    return storageService.get(PLANS_KEY) || [];
  },

  savePlan(plan) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) plans[idx] = plan;
    else plans.push(plan);
    storageService.set(PLANS_KEY, plans);
    return plan;
  },

  getLatestPlan() {
    const plans = this.getPlans();
    if (!plans.length) return null;
    return plans[plans.length - 1];
  },

  approvePlan(planId, approvedBy) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return null;
    plans[idx] = {
      ...plans[idx],
      approvalStatus: 'Approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
    };
    storageService.set(PLANS_KEY, plans);
    return plans[idx];
  },

  rejectPlan(planId, reason, rejectedBy) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return null;
    plans[idx] = {
      ...plans[idx],
      approvalStatus: 'Rejected',
      rejectionReason: reason,
      rejectedBy,
      rejectedAt: new Date().toISOString(),
    };
    storageService.set(PLANS_KEY, plans);
    return plans[idx];
  },

  modifyPlan(planId, optionId, modifications, modifiedBy) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx === -1) return null;
    plans[idx] = {
      ...plans[idx],
      approvalStatus: 'Modified',
      modifiedBy,
      modifiedAt: new Date().toISOString(),
      options: plans[idx].options.map(o =>
        o.id === optionId ? { ...o, ...modifications } : o
      ),
    };
    storageService.set(PLANS_KEY, plans);
    return plans[idx];
  },

  getStats() {
    const blocks = this.getAll();
    return {
      total: blocks.length,
      available: blocks.filter(b => b.status === 'Available').length,
      used: blocks.filter(b => b.status === 'Used').length,
      reserved: blocks.filter(b => b.status === 'Reserved').length,
      active: blocks.filter(b => b.status === 'Active').length,
    };
  },
};
