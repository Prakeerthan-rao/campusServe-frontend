import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import ticketService from '../../services/ticketService';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiLayers } from 'react-icons/fi';

export default function StaffRegister() {
  const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '', departmentId: '' });
  const [departments, setDepts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    ticketService.getAllDepartments().then(r => setDepts(r.data)).catch(() => { });
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email || !form.fullName)
      return toast.error('Fill in all required fields');
    setLoading(true);
    try {
      await api.post('/staff/register', { ...form, departmentId: form.departmentId ? Number(form.departmentId) : null });
      toast.success('Registration submitted! Contact admin for approval.');
      navigate('/staff/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' };

  return (
    <div className="auth-page auth-page-accent-staff">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon floating-icon" style={{ background: 'linear-gradient(135deg, var(--green), #1a9e66)' }}>🛠</div>
          <span className="auth-logo-text">Staff Portal</span>
        </div>
        <h1 className="auth-title">Staff Registration</h1>
        <p className="auth-subtitle">Create your staff account to get started</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={iconStyle} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="fullName" type="text" placeholder="Dr. Jane Smith"
                value={form.fullName} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username *</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={iconStyle} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="username" type="text" placeholder="jane_smith"
                value={form.username} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={iconStyle} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="email" type="email" placeholder="jane@campus.edu"
                value={form.email} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={iconStyle} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="password" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <div style={{ position: 'relative' }}>
              <FiLayers size={15} style={iconStyle} />
              <select className="form-input" style={{ paddingLeft: 38 }}
                name="departmentId" value={form.departmentId} onChange={handle}>
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="btn btn-lg w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', background: 'var(--green)', color: '#0d0f14' }}>
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <div className="auth-link">
          Already registered? <Link to="/staff/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}