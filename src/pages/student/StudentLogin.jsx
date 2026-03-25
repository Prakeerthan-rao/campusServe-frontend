import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

export default function StudentLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      await login(form.username, form.password, 'STUDENT');
      toast.success('Welcome back!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-accent-student">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon floating-icon">🎓</div>
          <span className="auth-logo-text">CampusServe</span>
        </div>
        <h1 className="auth-title">Student Login</h1>
        <p className="auth-subtitle">Sign in to raise and track your service requests</p>

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="username" placeholder="Enter your username"
                value={form.username} onChange={handle} autoComplete="username" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input className="form-input" style={{ paddingLeft: 38 }}
                name="password" type="password" placeholder="Enter your password"
                value={form.password} onChange={handle} autoComplete="current-password" />
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}>
            <FiLogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/student/register">Register here</Link>
        </div>
        <div className="auth-link" style={{ marginTop: 8 }}>
          <Link to="/admin/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Admin Login</Link>
          {' · '}
          <Link to="/staff/login" style={{ color: 'var(--text3)', fontSize: 13 }}>Staff Login</Link>
        </div>
      </div>
    </div>
  );
}
