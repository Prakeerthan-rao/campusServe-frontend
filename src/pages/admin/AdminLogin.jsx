import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShield, FiUser, FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password, 'ADMIN');
      toast.success('Admin access granted');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-accent-admin">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon floating-icon" style={{ background: 'linear-gradient(135deg, var(--orange), #e05a00)' }}>
            <FiShield size={20} color="#fff" />
          </div>
          <span className="auth-logo-text">Admin Panel</span>
        </div>
        <h1 className="auth-title">Administrator Login</h1>
        <p className="auth-subtitle">Restricted access — authorized personnel only</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="username" placeholder="admin" value={form.username} onChange={handle} />
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
            style={{ justifyContent: 'center', background: 'var(--orange)', color: '#fff' }}>
            {loading ? 'Authenticating…' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="auth-link" style={{ marginTop: 20 }}>
          <Link to="/student/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Student Login</Link>
          {' · '}
          <Link to="/staff/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Staff Login</Link>
        </div>
      </div>
    </div>
  );
}
