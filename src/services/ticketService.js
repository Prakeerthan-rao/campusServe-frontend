import api from './api';

const ticketService = {
  // Public (no auth needed)
  getAllDepartments:   ()           => api.get('/departments'),   // ✅ changed from /admin/departments

  // Student
  createTicket:       (data)       => api.post('/tickets', data),
  getMyTickets:       ()           => api.get('/tickets/my'),
  getTicketById:      (id)         => api.get(`/tickets/${id}`),
  closeTicket:        (id)         => api.patch(`/tickets/${id}/close`),

  // Staff
  getAssignedTickets: ()           => api.get('/tickets/assigned'),
  updateTicket:       (id, data)   => api.put(`/tickets/${id}`, data),

  // Admin
  getAllTickets:       (status)     => api.get('/tickets', { params: status ? { status } : {} }),
  deleteTicket:       (id)         => api.delete(`/tickets/${id}`),
  getDashboard:       ()           => api.get('/admin/dashboard'),
  getAdminDepartments: ()          => api.get('/admin/departments'), // kept for admin use
  getTicketsByDept:   (deptId)     => api.get(`/admin/tickets/department/${deptId}`),
  getAllStaff:         ()           => api.get('/staff'),
};

export default ticketService;
