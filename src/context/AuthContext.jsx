import { createContext, useContext, useState, useEffect } from 'react';
import { authService, ROLES } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.init();
    const session = authService.getSession();
    if (session) setUser(session.user);
    setLoading(false);
  }, []);

  const login = (identifier, password, role) => {
    const loggedUser = authService.login(identifier, password, role);
    setUser(loggedUser);
    return loggedUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const signup = (data) => {
    const newUser = authService.signup(data);
    setUser(newUser);
    return newUser;
  };

  const resetPassword = (emailOrPhone) => {
    return authService.resetPassword(emailOrPhone);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        resetPassword,
        roles: ROLES,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
