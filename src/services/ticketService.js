import api from './api';

const ticketService = {
  // Student
  createTicket:    (data) => api.post('/tickets', data),
  getMyTickets:    ()     => api.get('/tickets/my'),
  getTicketById:   (id)   => api.get(`/tickets/${id}`),
  closeTicket:     (id)   => api.patch(`/tickets/${id}/close`),

  // Staff
  getAssignedTickets: ()           => api.get('/tickets/assigned'),
  updateTicket:       (id, data)   => api.put(`/tickets/${id}`, data),

  // Admin
  getAllTickets:       (status)     => api.get('/tickets', { params: status ? { status } : {} }),
  deleteTicket:       (id)         => api.delete(`/tickets/${id}`),
  getDashboard:       ()           => api.get('/admin/dashboard'),
  getAllDepartments:   ()           => api.get('/admin/departments'),
  getTicketsByDept:   (deptId)     => api.get(`/admin/tickets/department/${deptId}`),

  // Staff list (for assignment)
  getAllStaff:         ()           => api.get('/staff'),
};

export default ticketService;
