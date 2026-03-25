import { FiX } from 'react-icons/fi';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export default function CategoryModal({ isOpen, onClose, title, type, data, loading, error, onItemClick, onBack }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div className="card fade-in" style={{
        width: '100%', maxWidth: 600, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', background: 'var(--surface)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onBack && (
              <button onClick={onBack} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)', 
                color: 'var(--text)', padding: '6px 12px', borderRadius: 8,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 500
              }}>
                ← Back
              </button>
            )}
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text3)',
            cursor: 'pointer', display: 'flex'
          }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>Loading details...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--orange)' }}>{error}</div>
          ) : data && data.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map((item, i) => {
                const isClickable = !!onItemClick;
                return (
                <div 
                  key={item.id || i}
                  onClick={() => isClickable && onItemClick(item, type)}
                  style={{
                    padding: 16, border: '1px solid var(--border)',
                    borderRadius: 12, background: 'var(--surface2)',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (isClickable) e.currentTarget.style.background = 'var(--surface3)'; }}
                  onMouseLeave={e => { if (isClickable) e.currentTarget.style.background = 'var(--surface2)'; }}
                >
                  {type === 'ticket' ? (
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <StatusBadge status={item.status} />
                        <PriorityBadge priority={item.priority} />
                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>#{item.id}</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{item.description}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>👤 {item.studentName || 'Unknown Student'}</span>
                        {item.departmentName && <span>🏢 {item.departmentName}</span>}
                        {item.createdAt && <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  ) : type === 'user' ? (
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.fullName || item.username || item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{item.email}</div>
                      {item.role && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Role: {item.role}</div>}
                      {item.department?.name && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Dept: {item.department.name}</div>}
                      {item.rollNumber && <div style={{ fontSize: 12, color: 'var(--text3)' }}>Roll No: {item.rollNumber}</div>}
                    </div>
                  ) : type === 'department' ? (
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{item.description || 'No description'}</div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>Click to view staff →</div>
                    </div>
                  ) : (
                    <pre style={{ fontSize: 12, margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>No items found in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
}
