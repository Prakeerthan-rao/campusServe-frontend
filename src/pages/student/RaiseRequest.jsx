import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';

export default function RaiseRequest() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', departmentId: '', priority: 'MEDIUM' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ticketService.getAllDepartments()
      .then(r => {
        const data = r.data;
        // Handle both array response and wrapped response
        if (Array.isArray(data)) {
          setDepartments(data);
        } else if (Array.isArray(data?.content)) {
          setDepartments(data.content);
        } else {
          console.error('Unexpected departments response:', data);
          setDepartments([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments:', err);
        toast.error('Could not load departments');
      });
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.departmentId)
      return toast.error('Please fill in all required fields');
    setLoading(true);
    try {
      await ticketService.createTicket({ ...form, departmentId: Number(form.departmentId) });
      toast.success('Ticket raised successfully!');
      navigate('/student/active');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Raise a Request" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Raise New Request</h1>
            <p className="page-subtitle">Submit a new service ticket to the appropriate department</p>
          </div>

          <div className="card" style={{ maxWidth: 640 }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" name="title" placeholder="Brief description of your issue"
                  value={form.title} onChange={handle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-input" name="departmentId" value={form.departmentId} onChange={handle}>
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" name="priority" value={form.priority} onChange={handle}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" name="description" rows={5}
                  placeholder="Describe your issue in detail…"
                  value={form.description} onChange={handle} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  <FiSend size={15} /> {loading ? 'Submitting…' : 'Submit Request'}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => navigate('/student/dashboard')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}