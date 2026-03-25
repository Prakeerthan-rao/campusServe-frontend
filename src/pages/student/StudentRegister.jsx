import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiHash } from 'react-icons/fi';

export default function StudentRegister() {
  const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email || !form.fullName)
      return toast.error('Fill in all required fields');
    setLoading(true);
    try {
      await api.post('/student/register', form);
      toast.success('Registration successful! Please login.');
      navigate('/student/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-accent-student">
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon floating-icon">🎓</div>
          <span className="auth-logo-text">CampusServe</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Register as a student to access the service portal</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="fullName" placeholder="John Doe" value={form.fullName} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Username *</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="username" placeholder="john_doe" value={form.username} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email *</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="email" type="email" placeholder="john@campus.edu" value={form.email} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <div style={{ position: 'relative' }}>
              <FiHash size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="rollNumber" placeholder="CS2024001" value={form.rollNumber} onChange={handle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handle} />
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already registered? <Link to="/student/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}