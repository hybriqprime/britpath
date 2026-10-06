import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ProtectedRoute({ role = 'admin' }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  if (!user || user.role !== role) {
    const to = role === 'admin' ? '/admin/login' : '/portal/login';
    return <Navigate to={to} replace state={{ from: location }} />;
  }

  return <Outlet />;
}