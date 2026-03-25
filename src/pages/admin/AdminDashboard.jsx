import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import CategoryModal from '../../components/CategoryModal';
import { FiUsers, FiList, FiCheckCircle, FiClock, FiXCircle, FiLayers } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState({ open: false, title: '', type: '', data: [], loading: false, error: '', previousState: null });

  useEffect(() => {
    ticketService.getDashboard()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { icon: FiList,        label: 'Total Tickets',    value: stats.totalTickets,      color: 'var(--accent)',  bg: 'rgba(79,142,255,0.12)', type: 'ticket', statusFilter: '' },
    { icon: FiClock,       label: 'Open',             value: stats.openTickets,        color: 'var(--yellow)', bg: 'rgba(255,209,102,0.12)', type: 'ticket', statusFilter: 'OPEN' },
    { icon: FiCheckCircle, label: 'In Progress',      value: stats.inProgressTickets,  color: 'var(--orange)', bg: 'rgba(255,140,66,0.12)', type: 'ticket', statusFilter: 'IN_PROGRESS' },
    { icon: FiCheckCircle, label: 'Resolved',         value: stats.resolvedTickets,    color: 'var(--green)',  bg: 'rgba(45,214,140,0.12)', type: 'ticket', statusFilter: 'RESOLVED' },
    { icon: FiXCircle,     label: 'Closed',           value: stats.closedTickets,      color: 'var(--text2)',  bg: 'rgba(93,102,128,0.18)', type: 'ticket', statusFilter: 'CLOSED' },
    { icon: FiUsers,       label: 'Students',         value: stats.totalStudents,      color: 'var(--accent)', bg: 'rgba(79,142,255,0.12)', type: 'user', fetchFn: () => api.get('/admin/students') },
    { icon: FiUsers,       label: 'Staff',            value: stats.totalStaff,         color: 'var(--green)',  bg: 'rgba(45,214,140,0.12)', type: 'user', fetchFn: () => ticketService.getAllStaff() },
    { icon: FiLayers,      label: 'Departments',      value: stats.totalDepartments,   color: 'var(--orange)', bg: 'rgba(255,140,66,0.12)', type: 'department', fetchFn: () => ticketService.getAllDepartments() },
  ] : [];

  const handleCardClick = async (card) => {
    setModalState({ open: true, title: card.label, type: card.type, data: [], loading: true, error: '', previousState: null });
    try {
      let res;
      if (card.type === 'ticket') {
        res = await ticketService.getAllTickets(card.statusFilter);
      } else if (card.fetchFn) {
        res = await card.fetchFn();
      }
      setModalState(s => ({ ...s, data: Array.isArray(res?.data) ? res.data : [], loading: false }));
    } catch (e) {
      // In case students API doesn't exist yet, we catch it smoothly
      setModalState(s => ({ ...s, data: [], loading: false, error: 'Could not fetch details. Endpoint might be missing.' }));
    }
  };

  const handleModalItemClick = async (item, itemType) => {
    if (itemType === 'department') {
      const prev = { title: modalState.title, type: modalState.type, data: modalState.data };
      setModalState(s => ({ ...s, loading: true, error: '' }));
      try {
        const res = await ticketService.getAllStaff();
        const deptStaff = res.data.filter(staff => 
          staff.department === item.id || 
          staff.department?.id === item.id || 
          staff.department?.name === item.name ||
          staff.department === item.name
        );
        setModalState({ 
          open: true, 
          title: `Staff - ${item.name}`, 
          type: 'user', 
          data: deptStaff, 
          loading: false, 
          error: deptStaff.length === 0 ? 'No staff found in this department.' : '',
          previousState: prev
        });
      } catch (e) {
        setModalState(s => ({ ...s, loading: false, error: 'Failed to fetch staff.' }));
      }
    }
  };

  const handleModalBack = () => {
    if (modalState.previousState) {
      setModalState(s => ({
        ...s,
        title: s.previousState.title,
        type: s.previousState.type,
        data: s.previousState.data,
        previousState: null,
        error: ''
      }));
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Admin Dashboard" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">System-wide overview and management</p>
          </div>

          {loading ? <Loader text="Loading dashboard…" /> : (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {cards.map(c => (
                <div 
                  className="stat-card" 
                  key={c.label} 
                  onClick={() => handleCardClick(c)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
                    <c.icon size={22} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{c.value ?? '—'}</div>
                    <div className="stat-label">{c.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <CategoryModal 
            isOpen={modalState.open}
            onClose={() => setModalState(s => ({ ...s, open: false }))}
            title={modalState.title}
            type={modalState.type}
            data={modalState.data}
            loading={modalState.loading}
            error={modalState.error}
            onItemClick={handleModalItemClick}
            onBack={modalState.previousState ? handleModalBack : undefined}
          />
        </main>
      </div>
    </div>
  );
}
