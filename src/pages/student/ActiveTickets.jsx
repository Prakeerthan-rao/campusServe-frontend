import { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TicketCard from '../../components/TicketCard';
import Loader from '../../components/Loader';

export default function ActiveTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getMyTickets()
      .then(r => setTickets(r.data.filter(t => ['OPEN','IN_PROGRESS'].includes(t.status))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <Navbar title="Active Tickets" />
        <main className="page-main fade-in">
          <div className="page-header">
            <h1 className="page-title">Active Tickets</h1>
            <p className="page-subtitle">{tickets.length} open or in-progress request{tickets.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? <Loader text="Loading tickets…" /> : (
            tickets.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state-icon">✅</div>
                <p>No active tickets. All resolved!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
