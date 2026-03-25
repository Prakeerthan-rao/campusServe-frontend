import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Student
import StudentLogin    from '../pages/student/StudentLogin';
import StudentRegister from '../pages/student/StudentRegister';
import StudentDashboard from '../pages/student/StudentDashboard';
import RaiseRequest    from '../pages/student/RaiseRequest';
import ActiveTickets   from '../pages/student/ActiveTickets';
import PastTickets     from '../pages/student/PastTickets';
import TrackTicket     from '../pages/student/TrackTicket';

// Admin
import AdminLogin      from '../pages/admin/AdminLogin';
import AdminDashboard  from '../pages/admin/AdminDashboard';
import AssignTicket    from '../pages/admin/AssignTicket';
import ViewStatus      from '../pages/admin/ViewStatus';

// Staff
import StaffLogin      from '../pages/staff/StaffLogin';
import StaffRegister   from '../pages/staff/StaffRegister';
import StaffDashboard  from '../pages/staff/StaffDashboard';
import UpdateTicket    from '../pages/staff/UpdateTicket';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={
        user?.role === 'STUDENT' ? <Navigate to="/student/dashboard" replace /> :
        user?.role === 'ADMIN'   ? <Navigate to="/admin/dashboard"   replace /> :
        user?.role === 'STAFF'   ? <Navigate to="/staff/dashboard"   replace /> :
        <Navigate to="/student/login" replace />
      } />

      {/* Student */}
      <Route path="/student/login"    element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/dashboard" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
      <Route path="/student/raise"    element={<PrivateRoute role="STUDENT"><RaiseRequest /></PrivateRoute>} />
      <Route path="/student/active"   element={<PrivateRoute role="STUDENT"><ActiveTickets /></PrivateRoute>} />
      <Route path="/student/past"     element={<PrivateRoute role="STUDENT"><PastTickets /></PrivateRoute>} />
      <Route path="/student/track/:id" element={<PrivateRoute role="STUDENT"><TrackTicket /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/login"     element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/assign"    element={<PrivateRoute role="ADMIN"><AssignTicket /></PrivateRoute>} />
      <Route path="/admin/status"    element={<PrivateRoute role="ADMIN"><ViewStatus /></PrivateRoute>} />

      {/* Staff */}
      <Route path="/staff/login"     element={<StaffLogin />} />
      <Route path="/staff/register"  element={<StaffRegister />} />
      <Route path="/staff/dashboard" element={<PrivateRoute role="STAFF"><StaffDashboard /></PrivateRoute>} />
      <Route path="/staff/tickets"   element={<PrivateRoute role="STAFF"><UpdateTicket /></PrivateRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
