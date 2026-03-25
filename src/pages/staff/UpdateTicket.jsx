import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FiEdit2, FiX, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const STEP_LABELS = { OPEN: 'Submitted', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

function PastTicketRow({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const currentStep = STEPS.indexOf(ticket.status);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Summary row */}
      <div onClick={() => setExpanded(e => !e)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ color: 'var(--text3)', fontSize: 13, minWidth: 28 }}>#{ticket.id}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
            {ticket.studentName} · {ticket.departmentName}
            {ticket.studentRollNumber ? ` · Roll: ${ticket.studentRollNumber}` : ''}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Description */}
            <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student's Issue</div>
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
                        {i > 0 && <div style={{ flex: 1, height: 2, background: done ? 'var(--green)' : 'var(--border)' }} />}
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: done ? 'var(--green)' : 'var(--surface)',
                          border: `2px solid ${active || done ? 'var(--green)' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: done ? '#fff' : 'var(--text3)',
                          boxShadow: active ? '0 0 10px rgba(45,214,140,0.4)' : 'none',
                        }}>{i + 1}</div>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? 'var(--green)' : 'var(--border)' }} />}
                      </div>
                      <span style={{ fontSize: 10, color: done ? 'var(--green)' : 'var(--text3)', marginTop: 6, fontWeight: done ? 600 : 400 }}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution */}
            {ticket.resolution ? (
              <div style={{ padding: '14px 16px', background: 'rgba(45,214,140,0.06)', border: '1px solid rgba(45,214,140,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--green)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ✅ What You Did to Fix It
                </div>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, fontSize: 14 }}>{ticket.resolution}</p>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolution</div>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>No resolution notes added.</p>
              </div>
            )}
          </div>

          {/* Details panel */}
          <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</div>
            {[
              ['Student', ticket.studentName],
              ['Roll No', ticket.studentRollNumber || '—'],
              ['Department', ticket.departmentName],
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

export default function UpdateTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ status: '', resolution: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('active'); // 'active' | 'past'

  useEffect(() => {
    ticketService.getAssignedTickets()
      .then(r => setTickets(Array.isArray(r.data) ? r.data : []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const activeTickets = tickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status));
  const pastTickets = tickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status));

  const startEdit = (t) => {
    setEditing(t);
    setForm({ status: t.status, resolution: t.resolution || '' });
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await ticketService.updateTicket(editing.id, form);
      setTickets(prev => prev.map(t => t.id === editing.id ? r.data : t));
      setEditing(null);
      toast.success('Ticket updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="My Tickets" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">My Tickets</h1>
            <p className="page-subtitle">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} assigned to you</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button className={`btn btn-sm ${tab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('active')}>
              Active ({activeTickets.length})
            </button>
            <button className={`btn btn-sm ${tab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('past')}>
              Past Work ({pastTickets.length})
            </button>
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (

            tab === 'active' ? (
              activeTickets.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>No active tickets</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {activeTickets.map(t => (
                    <div className="card" key={t.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <StatusBadge status={t.status} />
                            <PriorityBadge priority={t.priority} />
                            <span style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 4 }}>#{t.id}</span>
                          </div>
                          <h3 style={{ fontSize: 16, marginBottom: 4 }}>{t.title}</h3>
                          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 8 }}>{t.description}</p>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
                            <span>Student: {t.studentName}</span>
                            <span>Dept: {t.departmentName}</span>
                            <span>Roll: {t.studentRollNumber}</span>
                          </div>
                          {t.resolution && (
                            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(45,214,140,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--green)' }}>
                              ✅ {t.resolution}
                            </div>
                          )}
                        </div>
                        {editing?.id !== t.id && (
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(t)}>
                            <FiEdit2 size={13} /> Update
                          </button>
                        )}
                      </div>

                      {editing?.id === t.id && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div className="form-group">
                            <label className="form-label">Update Status</label>
                            <select className="form-input" value={form.status}
                              onChange={e => setForm({ ...form, status: e.target.value })}>
                              <option value="OPEN">Open</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="RESOLVED">Resolved</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Resolution Notes</label>
                            <textarea className="form-input" rows={3}
                              placeholder="Describe what was done to resolve this issue…"
                              value={form.resolution}
                              onChange={e => setForm({ ...form, resolution: e.target.value })} />
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-success btn-sm" onClick={save} disabled={saving}>
                              <FiCheck size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>
                              <FiX size={13} /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              pastTickets.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-state-icon">📂</div>
                  <p>No past work yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pastTickets.map(t => <PastTicketRow key={t.id} ticket={t} />)}
                </div>
              )
            )
          )}
        </main>
      </div>
    </div>
  );
}