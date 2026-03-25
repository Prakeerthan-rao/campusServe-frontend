import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import CategoryModal from '../../components/CategoryModal';
import { FiList, FiClock, FiCheckCircle, FiArchive } from 'react-icons/fi';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active' | 'history'

  const [modalState, setModalState] = useState({ open: false, title: '', type: 'ticket', data: [] });

  useEffect(() => {
    ticketService.getAssignedTickets()
      .then(r => setTickets(Array.isArray(r.data) ? r.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const active = tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status));
  const history = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS');

  const stats = [
    { icon: FiList, label: 'Total Assigned', value: tickets.length, color: 'var(--accent)', bg: 'rgba(79,142,255,0.12)', data: tickets },
    { icon: FiClock, label: 'In Progress', value: inProgress.length, color: 'var(--orange)', bg: 'rgba(255,140,66,0.12)', data: inProgress },
    { icon: FiCheckCircle, label: 'Resolved', value: history.length, color: 'var(--green)', bg: 'rgba(45,214,140,0.12)', data: history },
    { icon: FiArchive, label: 'Active', value: active.length, color: 'var(--yellow)', bg: 'rgba(255,209,102,0.12)', data: active },
  ];

  const displayTickets = tab === 'active' ? active : history;

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Staff Dashboard" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Welcome, {user?.fullName?.split(' ')[0]} 🛠</h1>
            <p className="page-subtitle">Manage your assigned service requests</p>
          </div>

          {/* Stats */}
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
                <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={22} /></div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, margin: '24px 0 16px' }}>
            <button
              className={`btn ${tab === 'active' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setTab('active')}>
              <FiClock size={13} /> Active Tickets ({active.length})
            </button>
            <button
              className={`btn ${tab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setTab('history')}>
              <FiArchive size={13} /> Previous Work ({history.length})
            </button>
          </div>

          {loading ? <Loader text="Loading…" /> : (
            displayTickets.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">{tab === 'active' ? '📭' : '🏆'}</div>
                <p>{tab === 'active' ? 'No active tickets assigned' : 'No completed work yet'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {displayTickets.map(t => (
                  <div className="card" key={t.id} style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <StatusBadge status={t.status} />
                          <PriorityBadge priority={t.priority} />
                          <span style={{ color: 'var(--text3)', fontSize: 12 }}>#{t.id}</span>
                        </div>
                        <h3 style={{ fontSize: 15, marginBottom: 4 }}>{t.title}</h3>
                        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>{t.description}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)', flexWrap: 'wrap' }}>
                          <span>👤 {t.studentName}</span>
                          <span>🏢 {t.departmentName}</span>
                          {t.studentRollNumber && <span>🎓 {t.studentRollNumber}</span>}
                          {t.createdAt && (
                            <span>📅 {new Date(t.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {/* Show resolution for completed tickets */}
                        {t.resolution && (
                          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(45,214,140,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--green)', borderLeft: '3px solid var(--green)' }}>
                            ✅ <strong>Resolution:</strong> {t.resolution}
                          </div>
                        )}
                      </div>
                      {/* Go to update page for active tickets */}
                      {tab === 'active' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/staff/tickets')}>
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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