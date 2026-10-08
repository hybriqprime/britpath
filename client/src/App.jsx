import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Clients from './pages/admin/Clients.jsx';
import ClientDetail from './pages/admin/ClientDetail.jsx';
import PortalLogin from './pages/portal/PortalLogin.jsx';
import Portal from './pages/portal/Portal.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/admin/login" element={<Login />} />
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/clients/:id" element={<ClientDetail />} />
        </Route>

        <Route path="/portal/login" element={<PortalLogin />} />
        <Route element={<ProtectedRoute role="client" />}>
          <Route path="/portal" element={<Portal />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}