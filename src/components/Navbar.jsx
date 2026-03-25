import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiBell, FiMail, FiLock, FiCheck, FiUser, FiHash, FiLayers, FiShield, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import ticketService from '../services/ticketService';

// ── Notification helpers ──────────────────────────────────────────────────────
const NOTIF_KEY = (userId) => `notifs_${userId}`;
const SEEN_KEY = (userId) => `seen_tickets_${userId}`;

function loadNotifs(userId) {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY(userId)) || '[]'); } catch { return []; }
}
function saveNotifs(userId, notifs) {
  localStorage.setItem(NOTIF_KEY(userId), JSON.stringify(notifs.slice(0, 50)));
}
function loadSeen(userId) {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY(userId)) || '{}'); } catch { return {}; }
}
function saveSeen(userId, seen) {
  localStorage.setItem(SEEN_KEY(userId), JSON.stringify(seen));
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar({ title = 'Campus Service' }) {
  const { user, login, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile panel state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoad, setProfileLoad] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const profileRef = useRef(null);

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef(null);

  const roleColor = {
    STUDENT: 'var(--accent)',
    STAFF: 'var(--green)',
    ADMIN: 'var(--orange)',
  }[user?.role] || 'var(--accent)';

  const roleEmoji = { STUDENT: '🎓', STAFF: '🛠', ADMIN: '🛡' }[user?.role] || '👤';
  const roleEndpoint = { STUDENT: 'student', STAFF: 'staff', ADMIN: 'admin' }[user?.role];

  // ── Load notifications from localStorage on mount ─────────────────────────
  useEffect(() => {
    if (!user?.userId) return;
    setNotifs(loadNotifs(user.userId));
  }, [user?.userId]);

  // ── Poll tickets and generate notifications ───────────────────────────────
  const pollNotifications = useCallback(async () => {
    if (!user?.userId || !user?.role) return;
    try {
      let tickets = [];
      if (user.role === 'STUDENT') {
        const r = await ticketService.getMyTickets();
        tickets = Array.isArray(r.data) ? r.data : [];
      } else if (user.role === 'STAFF') {
        const r = await ticketService.getAssignedTickets();
        tickets = Array.isArray(r.data) ? r.data : [];
      } else if (user.role === 'ADMIN') {
        const r = await ticketService.getAllTickets();
        tickets = Array.isArray(r.data) ? r.data : [];
      }

      const seen = loadSeen(user.userId);
      const current = loadNotifs(user.userId);
      const newOnes = [];

      tickets.forEach(t => {
        const key = String(t.id);
        const prev = seen[key];
        const status = t.status;

        if (user.role === 'STUDENT') {
          // New: ticket just raised (never seen before)
          if (!prev) {
            newOnes.push({
              id: `${t.id}_raised`,
              type: 'raised',
              icon: '🎫',
              text: `Your ticket "${t.title}" was submitted successfully.`,
              time: Date.now(),
              read: false,
              ticketId: t.id,
              link: `/student/track/${t.id}`,
            });
          }
          // Resolved
          if (prev && prev !== 'RESOLVED' && prev !== 'CLOSED' && status === 'RESOLVED') {
            newOnes.push({
              id: `${t.id}_resolved`,
              type: 'resolved',
              icon: '✅',
              text: `Your ticket "${t.title}" has been resolved!${t.resolution ? ' Notes: ' + t.resolution : ''}`,
              time: Date.now(),
              read: false,
              ticketId: t.id,
              link: `/student/track/${t.id}`,
            });
          }
        }

        if (user.role === 'ADMIN') {
          // New ticket raised
          if (!prev) {
            newOnes.push({
              id: `${t.id}_new`,
              type: 'new',
              icon: '🆕',
              text: `New ticket raised by ${t.studentName}: "${t.title}"`,
              time: Date.now(),
              read: false,
              ticketId: t.id,
              link: '/admin/status',
            });
          }
          // Any ticket resolved
          if (prev && prev !== 'RESOLVED' && prev !== 'CLOSED' && status === 'RESOLVED') {
            newOnes.push({
              id: `${t.id}_resolved`,
              type: 'resolved',
              icon: '✅',
              text: `Ticket #${t.id} "${t.title}" has been resolved.`,
              time: Date.now(),
              read: false,
              ticketId: t.id,
              link: '/admin/status',
            });
          }
        }

        if (user.role === 'STAFF') {
          // Newly assigned to this staff
          if (!prev) {
            newOnes.push({
              id: `${t.id}_assigned`,
              type: 'assigned',
              icon: '📋',
              text: `You've been assigned ticket #${t.id}: "${t.title}" from ${t.studentName}.`,
              time: Date.now(),
              read: false,
              ticketId: t.id,
              link: '/staff/tickets',
            });
          }
        }

        seen[key] = status;
      });

      saveSeen(user.userId, seen);

      if (newOnes.length > 0) {
        // Deduplicate by id
        const existingIds = new Set(current.map(n => n.id));
        const fresh = newOnes.filter(n => !existingIds.has(n.id));
        if (fresh.length > 0) {
          const updated = [...fresh, ...current];
          saveNotifs(user.userId, updated);
          setNotifs(updated);
        }
      }
    } catch { }
  }, [user?.userId, user?.role]);

  useEffect(() => {
    if (!user?.userId) return;
    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [pollNotifications]);

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifs(user.userId, updated);
  };

  const clearAll = () => {
    setNotifs([]);
    saveNotifs(user.userId, []);
  };

  const markRead = (id) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated);
    saveNotifs(user.userId, updated);
  };

  // Close panels on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
        resetForms();
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  // Profile load
  useEffect(() => {
    if (!profileOpen || profile) return;
    if (user?.role === 'ADMIN') {
      setProfile({
        fullName: localStorage.getItem('fullName'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('email'),
        role: 'ADMIN',
      });
      return;
    }
    setProfileLoad(true);
    api.get(`/${roleEndpoint}/${user.userId}`)
      .then(r => setProfile(r.data))
      .catch(() => {
        setProfile({
          fullName: localStorage.getItem('fullName'),
          username: localStorage.getItem('username'),
          email: localStorage.getItem('email'),
          role: user?.role,
        });
      })
      .finally(() => setProfileLoad(false));
  }, [profileOpen]);

  const resetForms = () => { 
    setEditMode(false); 
    setEditForm({ 
      username: profile?.username || user?.username || '', 
      fullName: profile?.fullName || user?.fullName || '', 
      email: profile?.email || user?.email || '', 
      password: '' 
    }); 
  };

  useEffect(() => {
    if (profile || user) resetForms();
  }, [profile, user]);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); navigate('/'); };

  const handleUpdateProfile = async () => {
    if (!editForm.username || !editForm.fullName || !editForm.email) return toast.error('Username, Name and Email are required');
    if (!user?.userId) return toast.error('User ID is missing. Please log out and log back in.');
    setSaving(true);
    try {
      const payload = {
        username: editForm.username,
        fullName: editForm.fullName,
        email: editForm.email
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      
      const res = await api.put(`/${roleEndpoint}/${user.userId}`, payload);
      const updatedProfile = res.data || payload;
      
      localStorage.setItem('username', updatedProfile.username || editForm.username);
      localStorage.setItem('email', updatedProfile.email || editForm.email);
      localStorage.setItem('fullName', updatedProfile.fullName || editForm.fullName);
      
      updateUser({
        username: updatedProfile.username || editForm.username,
        email: updatedProfile.email || editForm.email,
        fullName: updatedProfile.fullName || editForm.fullName
      });

      setProfile(p => ({ ...p, ...updatedProfile, password: undefined }));
      toast.success('Profile updated successfully');
      setEditMode(false);
      setEditForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} style={{ color: 'var(--text3)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</div>
      </div>
    </div>
  );

  const timeAgo = (ts) => {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const notifColor = { raised: 'var(--accent)', resolved: 'var(--green)', new: 'var(--orange)', assigned: 'var(--green)' };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 240, right: 0, height: 64,
      background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 100,
    }}>
      <h2 
        onClick={() => navigate('/')}
        style={{ fontSize: 17, fontFamily: 'var(--font-head)', fontWeight: 700, cursor: 'pointer' }}
      >
        {title}
      </h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* ── Notification Bell ── */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); if (!notifOpen) markAllRead(); }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, position: 'relative', paddingRight: unread > 0 ? 10 : undefined }}>
            <FiBell size={15} />
            Notifications
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                minWidth: 18, height: 18, borderRadius: 9,
                background: 'var(--orange)', color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', border: '2px solid var(--bg)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>{unread > 99 ? '99+' : unread}</span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 360,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden', zIndex: 200,
            }}>
              {/* Header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  Notifications {notifs.length > 0 && <span style={{ color: 'var(--text3)', fontWeight: 400, fontSize: 12 }}>({notifs.length})</span>}
                </div>
                {notifs.length > 0 && (
                  <button onClick={clearAll}
                    style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiX size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                    <div style={{ fontSize: 13 }}>No notifications yet</div>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.link) { setNotifOpen(false); navigate(n.link); }
                      }}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--border)',
                        background: n.read ? 'transparent' : 'rgba(79,142,255,0.04)',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        cursor: n.link ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (n.link) e.currentTarget.style.background = 'var(--surface2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(79,142,255,0.04)'; }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: `${notifColor[n.type] || 'var(--accent)'}18`,
                        border: `1px solid ${notifColor[n.type] || 'var(--accent)'}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>{n.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.time)}</span>
                          {n.link && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>View →</span>}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 5 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile ── */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div onClick={() => setProfileOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            padding: '6px 10px', borderRadius: 10,
            background: profileOpen ? 'var(--surface2)' : 'transparent',
            border: `1px solid ${profileOpen ? 'var(--border)' : 'transparent'}`,
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor}33, ${roleColor}66)`,
              border: `2px solid ${roleColor}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14, color: roleColor,
            }}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.fullName || user?.username}</div>
              <div style={{ fontSize: 11, color: roleColor, fontWeight: 600 }}>{user?.role}</div>
            </div>
          </div>

          {profileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 340,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden', zIndex: 200,
            }}>
              <div style={{
                padding: '20px', borderBottom: '1px solid var(--border)',
                background: `linear-gradient(135deg, ${roleColor}18, ${roleColor}05)`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${roleColor}44, ${roleColor}88)`,
                  border: `2px solid ${roleColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 800, color: '#fff',
                  boxShadow: `0 0 20px ${roleColor}44`,
                }}>
                  {(profile?.fullName || user?.fullName)?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{profile?.fullName || user?.fullName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>@{user?.username}</div>
                  <div style={{
                    marginTop: 6, fontSize: 11, fontWeight: 700, color: roleColor,
                    background: `${roleColor}22`, border: `1px solid ${roleColor}44`,
                    padding: '2px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}>{roleEmoji} {user?.role}</div>
                </div>
              </div>

              <div style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Profile Details</span>
                  <button onClick={() => {
                      if (editMode) resetForms();
                      else setEditMode(true);
                    }}
                    style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {profileLoad ? (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '20px 0' }}>Loading…</div>
                ) : editMode ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>Username</label>
                      <input className="input" placeholder="Username"
                        value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                        style={{ width: '100%', fontSize: 13, padding: '8px 12px', marginBottom: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>Full Name</label>
                      <input className="input" placeholder="Full Name"
                        value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                        style={{ width: '100%', fontSize: 13, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>Email</label>
                      <input type="email" className="input" placeholder="Email"
                        value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ width: '100%', fontSize: 13, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>New Password (Optional)</label>
                      <input type="password" className="input" placeholder="Leave blank to keep current"
                        value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                        style={{ width: '100%', fontSize: 13, padding: '8px 12px' }} />
                    </div>
                    <button className="btn btn-primary w-full" onClick={handleUpdateProfile} disabled={saving} style={{ justifyContent: 'center', marginTop: 8 }}>
                      {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                  </div>
                ) : (
                  <>
                    <InfoRow icon={FiUser} label="Full Name" value={profile?.fullName || user?.fullName} />
                    <InfoRow icon={FiUser} label="Username" value={profile ? '@' + profile.username : '@' + user?.username} />
                    <InfoRow icon={FiMail} label="Email" value={profile?.email || user?.email} />
                    <InfoRow icon={FiShield} label="Role" value={profile?.role || user?.role} />
                    {user?.role === 'STUDENT' && <InfoRow icon={FiHash} label="Roll Number" value={profile?.rollNumber || 'Not set'} />}
                    {profile?.department && <InfoRow icon={FiLayers} label="Department" value={profile.department?.name || profile.department} />}
                  </>
                )}
              </div>

              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-danger w-full" style={{ justifyContent: 'center' }} onClick={handleLogout}>
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          <FiLogOut size={14} /> Logout
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.15); }
        }
      `}</style>
    </header>
  );
}