import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiXCircle } from 'react-icons/fi';

const STEPS = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED'];
const STEP_LABELS = { OPEN: 'Submitted', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

export default function TrackTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    ticketService.getTicketById(id)
      .then(r => setTicket(r.data))
      .catch(() => toast.error('Ticket not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = async () => {
    if (!window.confirm('Close this ticket?')) return;
    setClosing(true);
    try {
      const r = await ticketService.closeTicket(id);
      setTicket(r.data);
      toast.success('Ticket closed');
    } catch { toast.error('Failed to close ticket'); }
    finally { setClosing(false); }
  };

  const currentStep = ticket ? STEPS.indexOf(ticket.status) : 0;

  if (loading) return <div className="page-layout"><Sidebar /><div className="page-content"><Navbar /><main className="page-main"><Loader text="Loading…" /></main></div></div>;
  if (!ticket) return null;

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Track Ticket" />
        <main className="page-main fade-in">
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }} onClick={() => navigate(-1)}>
            <FiArrowLeft size={14} /> Back
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            {/* Main */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>#{ticket.id}</span>
                </div>
                <h2 style={{ fontSize: 22, marginBottom: 12 }}>{ticket.title}</h2>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{ticket.description}</p>
              </div>

              {/* Progress */}
              <div className="card">
                <h3 style={{ fontSize: 16, marginBottom: 20 }}>Ticket Progress</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {STEPS.map((step, i) => {
                    const done   = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {i > 0 && <div style={{ flex: 1, height: 2, background: done ? 'var(--accent)' : 'var(--border)' }} />}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: done ? 'var(--accent)' : 'var(--surface2)',
                            border: `2px solid ${active ? 'var(--accent)' : done ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: done ? '#fff' : 'var(--text3)',
                            boxShadow: active ? '0 0 12px var(--accent-glow)' : 'none',
                          }}>{i + 1}</div>
                          {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? 'var(--accent)' : 'var(--border)' }} />}
                        </div>
                        <span style={{ fontSize: 11, color: done ? 'var(--accent)' : 'var(--text3)', marginTop: 8, fontWeight: done ? 600 : 400 }}>
                          {STEP_LABELS[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ticket.resolution && (
                <div className="card" style={{ borderColor: 'rgba(45,214,140,0.3)', background: 'rgba(45,214,140,0.05)' }}>
                  <h3 style={{ fontSize: 15, color: 'var(--green)', marginBottom: 8 }}>✅ Resolution</h3>
                  <p style={{ color: 'var(--text2)', lineHeight: 1.7 }}>{ticket.resolution}</p>
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, marginBottom: 16 }}>Details</h3>
                {[
                  ['Department', ticket.departmentName],
                  ['Assigned To', ticket.assignedStaffName || 'Unassigned'],
                  ['Created', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '—'],
                  ['Updated', ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-IN') : '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 13 }}>{k}</span>
                    <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>

              {['OPEN','IN_PROGRESS'].includes(ticket.status) && (
                <button className="btn btn-danger w-full" style={{ justifyContent: 'center' }}
                  onClick={handleClose} disabled={closing}>
                  <FiXCircle size={15} /> {closing ? 'Closing…' : 'Close Ticket'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
