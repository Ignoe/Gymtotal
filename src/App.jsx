import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './middleware/ProtectedRoute';

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
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAssistance from './pages/admin/AdminAssistance';
import AdminPayments from './pages/admin/AdminPayments';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Kiosk routes ── */}
          <Route path="/" element={<Validation />} />
          <Route path="/home" element={<Home />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/daily-goal" element={<DailyGoal />} />
          <Route path="/assistance" element={<Assistance />} />
          <Route path="/new-member" element={<NewMember />} />
          <Route path="/shop" element={<Shop />} />

          {/* ── Admin routes ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
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
    </AppProvider>
  );
}
