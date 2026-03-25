import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { FiTrash2, FiXCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STEP_LABELS = { OPEN: 'Submitted', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

function TicketRow({ ticket, onDelete, onClose, deleting, closing }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STEPS.indexOf(ticket.status);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(e => !e)}>
        <span style={{ color: 'var(--text3)', fontSize: 13, minWidth: 28 }}>#{ticket.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {ticket.studentName} · {ticket.departmentName}
          </div>
        </div>
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : '—'}
        </span>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {ticket.status === 'RESOLVED' && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onClose(ticket.id)}
              disabled={closing === ticket.id}
              title="Close Ticket">
              <FiXCircle size={13} />
              {closing === ticket.id ? '…' : 'Close'}
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(ticket.id)}
            disabled={deleting === ticket.id}
            title="Delete Ticket">
            <FiTrash2 size={13} />
          </button>
        </div>
        {expanded
          ? <FiChevronUp size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          : <FiChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Description */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{ticket.description}</p>
            </div>

            {/* Progress stepper */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket Progress</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {i > 0 && <div style={{ flex: 1, height: 2, background: done ? 'var(--accent)' : 'var(--border)' }} />}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: done ? 'var(--accent)' : 'var(--surface)',
                          border: `2px solid ${active || done ? 'var(--accent)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: done ? '#fff' : 'var(--text3)',
                          boxShadow: active ? '0 0 10px rgba(79,142,255,0.4)' : 'none',
                        }}>{i + 1}</div>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? 'var(--accent)' : 'var(--border)' }} />}
                      </div>
                      <span style={{ fontSize: 10, color: done ? 'var(--accent)' : 'var(--text3)', marginTop: 6, fontWeight: done ? 600 : 400 }}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution */}
            {ticket.resolution && (
              <div style={{ padding: '14px 16px', background: 'rgba(45,214,140,0.06)', border: '1px solid rgba(45,214,140,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--green)', marginBottom: 6, fontWeight: 600 }}>✅ Resolution</div>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{ticket.resolution}</p>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</div>
            {[
              ['Student', ticket.studentName],
              ['Roll No', ticket.studentRollNumber || '—'],
              ['Department', ticket.departmentName],
              ['Assigned To', ticket.assignedStaffName || 'Unassigned'],
              ['Priority', ticket.priority],
              ['Created', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '—'],
              ['Updated', ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-IN') : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                <span style={{ color: 'var(--text3)', fontSize: 13, flexShrink: 0 }}>{k}</span>
                <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewStatus() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [deleting, setDeleting] = useState(null);
  const [closing, setClosing] = useState(null);

  const load = (status) => {
    setLoading(true);
    const p = status === 'ALL' ? ticketService.getAllTickets() : ticketService.getAllTickets(status);
    p.then(r => setTickets(Array.isArray(r.data) ? r.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    setDeleting(id);
    try {
      await ticketService.deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success('Ticket deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this ticket?')) return;
    setClosing(id);
    try {
      const r = await ticketService.closeTicket(id);
      setTickets(prev => prev.map(t => t.id === id ? r.data : t));
      toast.success('Ticket closed');
    } catch { toast.error('Failed to close ticket'); }
    finally { setClosing(null); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="View All Tickets" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">All Tickets</h1>
            <p className="page-subtitle">Monitor and manage all service requests</p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (
            tickets.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No tickets found for this filter</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tickets.map(t => (
                  <TicketRow
                    key={t.id}
                    ticket={t}
                    onDelete={handleDelete}
                    onClose={handleClose}
                    deleting={deleting}
                    closing={closing}
                  />
                ))}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}