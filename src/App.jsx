import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './middleware/ProtectedRoute';
import { UserProtectedRoute } from './middleware/UserProtectedRoute';
import { useApp } from './context/AppContext';

// Kiosk pages
import Home from './pages/user/home/Home';
import Validation from './pages/user/validacion/Validation';
import Payments from './pages/user/pagos/Payments';
import Routine from './pages/user/rutina/Routine';
import DailyGoal from './pages/user/objetivoDiario/DailyGoal';
import Assistance from './pages/user/asistencia/Assistance';
import NewMember from './pages/user/nuevoUser/NewMember';
import Shop from './pages/user/compras/Shop';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/dashboardAdmin/AdminDashboard';
import AdminUsers from './pages/admin/sociosAdmin/AdminUsers';
import AdminAssistance from './pages/admin/asistenciaAdmin/AdminAssistance';
import AdminPayments from './pages/admin/pagosAdmin/AdminPayments';

function AppRoutes() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: 24,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          color: 'white',
          fontWeight: 900,
          padding: '10px 20px',
          borderRadius: 12,
          fontSize: '1.5rem',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}>GT</div>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Conectando a GymTotal...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Kiosk routes ── */}
        <Route path="/" element={<Validation />} />
        <Route path="/home" element={<UserProtectedRoute><Home /></UserProtectedRoute>} />
        <Route path="/payments" element={<UserProtectedRoute><Payments /></UserProtectedRoute>} />
        <Route path="/routine" element={<UserProtectedRoute><Routine /></UserProtectedRoute>} />
        <Route path="/daily-goal" element={<UserProtectedRoute><DailyGoal /></UserProtectedRoute>} />
        <Route path="/assistance" element={<UserProtectedRoute><Assistance /></UserProtectedRoute>} />
        <Route path="/new-member" element={<NewMember />} />
        <Route path="/shop" element={<UserProtectedRoute><Shop /></UserProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="assistance" element={<AdminAssistance />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
