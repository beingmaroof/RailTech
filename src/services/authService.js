// ============================================================
// AUTH SERVICE — Enterprise Authentication & Role Management
// ============================================================
import { storageService } from './storageService.js';
import { DEMO_USERS } from '../data/demoData.js';

const SESSION_KEY = 'session';
const USERS_KEY = 'users';

// Enterprise roles without personal names
export const ROLES = [
  { id: 'admin', label: 'Admin', defaultPath: '/admin/dashboard' },
  { id: 'control', label: 'Control Office', defaultPath: '/control/dashboard' },
  { id: 'engineering', label: 'Track & Field Engineer', defaultPath: '/engineering/dashboard' },
  { id: 'snt', label: 'Signal & Telecom Engineer', defaultPath: '/snt/dashboard' },
  { id: 'traction', label: 'Traction Engineer', defaultPath: '/traction/dashboard' },

];

function seedUsers() {
  if (!storageService.has(USERS_KEY)) {
    storageService.set(USERS_KEY, DEMO_USERS);
  }
}

export const authService = {
  init() {
    seedUsers();
  },

  getRoles() {
    return ROLES;
  },

  login(identifier, password, selectedRole = 'admin') {
    const cleanId = (identifier || 'official.user').trim();
    const cleanRole = selectedRole || 'admin';

    // Canonical role is cleanRole directly
    const appRole = cleanRole;

    // Role display titles
    const roleObj = ROLES.find(r => r.id === cleanRole) || ROLES[0];

    const user = {
      id: cleanId.toUpperCase(),
      name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId.toLowerCase()}@railway.gov.in`,
      role: appRole,
      specificRole: cleanRole,
      roleLabel: roleObj.label,
      department: roleObj.label,
      designation: roleObj.label,
    };

    const session = { user, loggedInAt: new Date().toISOString() };
    storageService.set(SESSION_KEY, session);
    return user;
  },

  logout() {
    storageService.remove(SESSION_KEY);
  },

  getSession() {
    return storageService.get(SESSION_KEY);
  },

  isAuthenticated() {
    return !!storageService.get(SESSION_KEY);
  },

  getCurrentUser() {
    const session = storageService.get(SESSION_KEY);
    return session ? session.user : null;
  },

  signup(data) {
    const cleanRole = data.role || 'engineering';
    const appRole = cleanRole;

    const roleObj = ROLES.find(r => r.id === cleanRole) || ROLES[1];

    const newUser = {
      id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name || 'Official User',
      email: data.email || 'user@railway.gov.in',
      phone: data.phone || '+91 9876543210',
      role: appRole,
      specificRole: cleanRole,
      roleLabel: roleObj.label,
      department: roleObj.label,
      designation: 'Officer',
    };

    const storedUsers = storageService.get(USERS_KEY) || DEMO_USERS;
    storedUsers.push(newUser);
    storageService.set(USERS_KEY, storedUsers);

    const session = { user: newUser, loggedInAt: new Date().toISOString() };
    storageService.set(SESSION_KEY, session);
    return newUser;
  },

  resetPassword(emailOrPhone) {
    return {
      success: true,
      message: `Password reset link & temporary OTP sent to ${emailOrPhone}.`,
    };
  },
};
