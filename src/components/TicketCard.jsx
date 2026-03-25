import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { FiClock, FiUser, FiArrowRight } from 'react-icons/fi';

export default function TicketCard({ ticket, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(ticket);
    else navigate(`/student/track/${ticket.id}`);
  };

  const date = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="card card-hover" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 13 }}>#{ticket.id}</span>
      </div>

      <h3 style={{ fontSize: 16, marginBottom: 6, fontFamily: 'var(--font-head)' }}>{ticket.title}</h3>
      <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.5, marginBottom: 16,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {ticket.description}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: 12 }}>
            <FiClock size={12} /> {date}
          </span>
          {ticket.departmentName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text3)', fontSize: 12 }}>
              <FiUser size={12} /> {ticket.departmentName}
            </span>
          )}
        </div>
        <FiArrowRight size={16} color="var(--accent)" />
      </div>
    </div>
  );
}
