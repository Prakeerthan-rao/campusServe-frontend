import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STEP_LABELS = { OPEN: 'Submitted', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

function TicketRow({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STEPS.indexOf(ticket.status);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Summary row — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: 'var(--text3)', fontSize: 13, minWidth: 28 }}>#{ticket.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {ticket.departmentName} {ticket.assignedStaffName ? `· ${ticket.assignedStaffName}` : ''}
          </div>
        </div>
        <PriorityBadge priority={ticket.priority} />
        <StatusBadge status={ticket.status} />
        <span style={{ fontSize: 12, color: 'var(--text3)', flexShrink: 0 }}>
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : '—'}
        </span>
        {expanded
          ? <FiChevronUp size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          : <FiChevronDown size={16} style={{ color: 'var(--text3)', flexShrink: 0 }} />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

          {/* Left: description + progress + resolution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Description */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{ticket.description}</p>
            </div>

            {/* Progress stepper */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</div>
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

            {/* Resolution — what staff did */}
            {ticket.resolution ? (
              <div style={{ padding: '14px 16px', background: 'rgba(45,214,140,0.06)', border: '1px solid rgba(45,214,140,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✅ How it was fixed
                </div>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{ticket.resolution}</p>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolution</div>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>No resolution notes provided.</p>
              </div>
            )}
          </div>

          {/* Right: details panel */}
          <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</div>
            {[
              ['Department', ticket.departmentName],
              ['Handled By', ticket.assignedStaffName || 'Unassigned'],
              ['Priority', ticket.priority],
              ['Status', ticket.status?.replace('_', ' ')],
              ['Submitted', ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN') : '—'],
              ['Last Updated', ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString('en-IN') : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
                <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>{k}</span>
                <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PastTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getMyTickets()
      .then(r => setTickets(r.data.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status))))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Past Tickets" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Past Tickets</h1>
            <p className="page-subtitle">{tickets.length} resolved or closed ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (
            tickets.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">📂</div>
                <p>No past tickets found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tickets.map(t => <TicketRow key={t.id} ticket={t} />)}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}