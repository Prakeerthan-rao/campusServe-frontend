import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiPlusCircle, FiList, FiArchive, FiSearch,
  FiUsers, FiSettings, FiClipboard, FiCheckSquare, FiUserCheck,
} from 'react-icons/fi';

const STUDENT_LINKS = [
  { to: '/student/dashboard',  icon: FiGrid,       label: 'Dashboard' },
  { to: '/student/raise',      icon: FiPlusCircle,  label: 'Raise Request' },
  { to: '/student/active',     icon: FiList,        label: 'Active Tickets' },
  { to: '/student/past',       icon: FiArchive,     label: 'Past Tickets' },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard',  icon: FiGrid,       label: 'Dashboard' },
  { to: '/admin/assign',     icon: FiUserCheck,  label: 'Assign Tickets' },
  { to: '/admin/status',     icon: FiClipboard,  label: 'View Status' },
];

const STAFF_LINKS = [
  { to: '/staff/dashboard',  icon: FiGrid,        label: 'Dashboard' },
  { to: '/staff/tickets',    icon: FiCheckSquare, label: 'Update Ticket' },
];

const ROLE_LINKS = { STUDENT: STUDENT_LINKS, ADMIN: ADMIN_LINKS, STAFF: STAFF_LINKS };
const ROLE_COLOR = { STUDENT: 'var(--accent)', ADMIN: 'var(--orange)', STAFF: 'var(--green)' };
const ROLE_LABEL = { STUDENT: '🎓 Student Portal', ADMIN: '⚙️ Admin Panel', STAFF: '🛠 Staff Portal' };

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const links  = ROLE_LINKS[user?.role]  || [];
  const color  = ROLE_COLOR[user?.role]  || 'var(--accent)';
  const label  = ROLE_LABEL[user?.role]  || 'Portal';

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 240,
      background: 'var(--bg2)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 200,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, cursor: 'pointer' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🏫</div>
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16 }}>CampusServe</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, paddingLeft: 46 }}>{label}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            fontSize: 14, fontWeight: 500,
            color: isActive ? color : 'var(--text2)',
            background: isActive ? `${color}15` : 'transparent',
            borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
            transition: 'all 0.18s ease',
            textDecoration: 'none',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
        Campus Service v1.0
      </div>
    </aside>
  );
}
