import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authService.isLoggedIn()) {
      setUser({
        token:    authService.getToken(),
        role:     authService.getRole(),
        userId:   authService.getUserId(),
        username: authService.getUsername(),
        fullName: authService.getFullName(),
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password, role) => {
    const data = await authService.login(username, password, role);
    setUser({
      token:    data.token,
      role:     data.role,
      userId:   data.userId,
      username: data.username,
      fullName: data.fullName,
    });
    return data;
  };

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
