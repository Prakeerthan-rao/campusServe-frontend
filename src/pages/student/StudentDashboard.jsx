import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TicketCard from '../../components/TicketCard';
import Loader from '../../components/Loader';
import CategoryModal from '../../components/CategoryModal';
import { FiPlusCircle, FiList, FiCheckCircle, FiArchive } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalState, setModalState] = useState({ open: false, title: '', type: 'ticket', data: [] });

  useEffect(() => {
    ticketService.getMyTickets()
      .then(r => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active   = tickets.filter(t => ['OPEN','IN_PROGRESS'].includes(t.status));
  const resolved = tickets.filter(t => ['RESOLVED','CLOSED'].includes(t.status));
  const recent   = [...tickets].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,3);

  const stats = [
    { icon: FiList,        label: 'Total Tickets',   value: tickets.length,   bg: 'rgba(79,142,255,0.12)',  color: 'var(--accent)', data: tickets },
    { icon: FiPlusCircle,  label: 'Active',          value: active.length,    bg: 'rgba(255,209,102,0.12)', color: 'var(--yellow)', data: active },
    { icon: FiCheckCircle, label: 'Resolved',        value: resolved.length,  bg: 'rgba(45,214,140,0.12)',  color: 'var(--green)', data: resolved },
    { icon: FiArchive,     label: 'Closed',          value: tickets.filter(t=>t.status==='CLOSED').length, bg: 'rgba(93,102,128,0.18)', color: 'var(--text2)', data: tickets.filter(t=>t.status==='CLOSED') },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Student Dashboard" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
            <p className="page-subtitle">Here's an overview of your service requests</p>
          </div>

          <div className="stats-grid">
            {stats.map(s => (
              <div 
                className="stat-card" 
                key={s.label}
                onClick={() => setModalState({ open: true, title: s.label, type: 'ticket', data: s.data })}
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                  <s.icon size={22} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <button className="btn btn-primary" onClick={() => navigate('/student/raise')}>
              <FiPlusCircle size={16} /> Raise New Request
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/student/active')}>
              <FiList size={16} /> View Active Tickets
            </button>
          </div>

          <div className="section-header">
            <h2 className="section-title">Recent Requests</h2>
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (
            recent.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">🎫</div>
                <p>No tickets yet. <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/student/raise')}>Raise your first request →</span></p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {recent.map(t => <TicketCard key={t.id} ticket={t} />)}
              </div>
            )
          )}

          <CategoryModal 
            isOpen={modalState.open}
            onClose={() => setModalState(s => ({ ...s, open: false }))}
            title={modalState.title}
            type={modalState.type}
            data={modalState.data}
          />
        </main>
      </div>
    </div>
  );
}
