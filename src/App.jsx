import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './middleware/ProtectedRoute';

// Kiosk pages
import Home from './pages/Home';
import Validation from './pages/Validation';
import Payments from './pages/Payments';
import Routine from './pages/Routine';
import DailyGoal from './pages/DailyGoal';
import Assistance from './pages/Assistance';
import NewMember from './pages/NewMember';
import Shop from './pages/Shop';

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
          <Route path="/"             element={<Home />} />
          <Route path="/validation"   element={<Validation />} />
          <Route path="/payments"     element={<Payments />} />
          <Route path="/routine"      element={<Routine />} />
          <Route path="/daily-goal"   element={<DailyGoal />} />
          <Route path="/assistance"   element={<Assistance />} />
          <Route path="/new-member"   element={<NewMember />} />
          <Route path="/shop"         element={<Shop />} />

          {/* ── Admin routes ── */}
          <Route path="/admin/login"  element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<AdminDashboard />} />
            <Route path="users"         element={<AdminUsers />} />
            <Route path="assistance"    element={<AdminAssistance />} />
            <Route path="payments"      element={<AdminPayments />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
