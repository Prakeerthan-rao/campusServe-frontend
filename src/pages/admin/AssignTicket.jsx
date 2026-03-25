import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';
import { FiUserCheck } from 'react-icons/fi';

export default function AssignTicket() {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  // Per-ticket selections: { ticketId: { deptId, staffId } }
  const [selections, setSelections] = useState({});

  useEffect(() => {
    Promise.all([
      ticketService.getAllTickets('OPEN'),
      ticketService.getAllStaff(),
      ticketService.getAllDepartments(),
    ]).then(([tr, sr, dr]) => {
      setTickets(Array.isArray(tr.data) ? tr.data : []);
      setStaff(Array.isArray(sr.data) ? sr.data : []);
      setDepartments(Array.isArray(dr.data) ? dr.data : []);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const setDept = (ticketId, deptId) => {
    setSelections(prev => ({
      ...prev,
      [ticketId]: { deptId, staffId: '' }  // reset staff when dept changes
    }));
  };

  const setStaffId = (ticketId, staffId) => {
    setSelections(prev => ({
      ...prev,
      [ticketId]: { ...prev[ticketId], staffId }
    }));
  };

  const assign = async (ticketId) => {
    const staffId = selections[ticketId]?.staffId;
    if (!staffId) return toast.error('Select a staff member first');
    setSaving(ticketId);
    try {
      await ticketService.updateTicket(ticketId, { assignedStaffId: Number(staffId) });
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      toast.success('Ticket assigned successfully');
    } catch { toast.error('Assignment failed'); }
    finally { setSaving(null); }
  };

  const staffForTicket = (ticketId) => {
    const deptId = selections[ticketId]?.deptId;
    if (!deptId) return [];
    return staff.filter(s => String(s.department?.id) === String(deptId));
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Assign Tickets" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Assign Tickets</h1>
            <p className="page-subtitle">
              {tickets.length} unassigned open ticket{tickets.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (
            tickets.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">🎉</div>
                <p>All tickets have been assigned!</p>
              </div>
            ) : (
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Student</th>
                        <th>Priority</th>
                        <th>Select Department</th>
                        <th>Select Staff</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(t => {
                        const sel = selections[t.id] || {};
                        const availableStaff = staffForTicket(t.id);

                        return (
                          <tr key={t.id}>
                            <td>{t.id}</td>
                            <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.title}
                            </td>
                            <td>{t.studentName}</td>
                            <td><PriorityBadge priority={t.priority} /></td>

                            {/* Step 1: Pick department */}
                            <td>
                              <select
                                className="form-input"
                                style={{ padding: '6px 10px', fontSize: 13, width: 160 }}
                                value={sel.deptId || ''}
                                onChange={e => setDept(t.id, e.target.value)}>
                                <option value="">— Select dept —</option>
                                {departments.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </td>

                            {/* Step 2: Pick staff (only shows after dept selected) */}
                            <td>
                              {sel.deptId ? (
                                availableStaff.length > 0 ? (
                                  <select
                                    className="form-input"
                                    style={{ padding: '6px 10px', fontSize: 13, width: 160 }}
                                    value={sel.staffId || ''}
                                    onChange={e => setStaffId(t.id, e.target.value)}>
                                    <option value="">— Select staff —</option>
                                    {availableStaff.map(s => (
                                      <option key={s.id} value={s.id}>{s.fullName}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>No staff in dept</span>
                                )
                              ) : (
                                <span style={{ fontSize: 12, color: 'var(--text3)' }}>Select dept first</span>
                              )}
                            </td>

                            {/* Assign button */}
                            <td>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => assign(t.id)}
                                disabled={saving === t.id || !sel.staffId}>
                                <FiUserCheck size={13} />
                                {saving === t.id ? '…' : 'Assign'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}