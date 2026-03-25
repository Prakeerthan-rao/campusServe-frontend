import api from './api';

const authService = {
  login: async (username, password, role) => {
    const res = await api.post('/auth/login', { username, password, role });
    const data = res.data;
    localStorage.setItem('token',    data.token);
    localStorage.setItem('role',     data.role);
    localStorage.setItem('userId',   data.userId);
    localStorage.setItem('username', data.username);
    localStorage.setItem('fullName', data.fullName);
    localStorage.setItem('email',    data.email);
    return data;
  },

  logout: () => {
    localStorage.clear();
  },

  getToken:    () => localStorage.getItem('token'),
  getRole:     () => localStorage.getItem('role'),
  getUserId:   () => localStorage.getItem('userId'),
  getUsername: () => localStorage.getItem('username'),
  getFullName: () => localStorage.getItem('fullName'),
  isLoggedIn:  () => !!localStorage.getItem('token'),
};

export default authService;
