import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiTool, FiUser, FiLock } from 'react-icons/fi';

export default function StaffLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password, 'STAFF');
      toast.success('Welcome back!');
      navigate('/staff/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-accent-staff">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon floating-icon" style={{ background: 'linear-gradient(135deg, var(--green), #1a9e66)' }}>
            <FiTool size={20} color="#fff" />
          </div>
          <span className="auth-logo-text">Staff Portal</span>
        </div>
        <h1 className="auth-title">Staff Login</h1>
        <p className="auth-subtitle">Sign in to manage and resolve service requests</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="username" placeholder="Staff username" value={form.username} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} />
            </div>
          </div>
          <button className="btn btn-lg w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', background: 'var(--green)', color: '#0d0f14' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-link">
          New staff member? <Link to="/staff/register">Register here</Link>
        </div>
        <div className="auth-link" style={{ marginTop: 8 }}>
          <Link to="/student/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Student Login</Link>
          {' · '}
          <Link to="/admin/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
