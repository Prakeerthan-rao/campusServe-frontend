const STATUS_STYLES = {
  OPEN:        { bg: 'rgba(79,142,255,0.12)',  color: '#4f8eff', label: 'Open' },
  IN_PROGRESS: { bg: 'rgba(255,209,102,0.12)', color: '#ffd166', label: 'In Progress' },
  RESOLVED:    { bg: 'rgba(45,214,140,0.12)',  color: '#2dd68c', label: 'Resolved' },
  CLOSED:      { bg: 'rgba(93,102,128,0.18)',  color: '#9aa3bc', label: 'Closed' },
};

const PRIORITY_STYLES = {
  LOW:    { bg: 'rgba(93,102,128,0.18)',  color: '#9aa3bc', label: 'Low' },
  MEDIUM: { bg: 'rgba(79,142,255,0.12)',  color: '#4f8eff', label: 'Medium' },
  HIGH:   { bg: 'rgba(255,140,66,0.12)',  color: '#ff8c42', label: 'High' },
  URGENT: { bg: 'rgba(255,79,106,0.12)',  color: '#ff4f6a', label: 'Urgent' },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const p = PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM;
  return (
    <span style={{
      background: p.bg, color: p.color,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}>
      {p.label}
    </span>
  );
}

export default StatusBadge;
