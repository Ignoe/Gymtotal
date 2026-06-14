import { Navigate, useLocation } from 'react-router-dom';
import { adminAuth } from './adminAuth';

/**
 * ProtectedRoute — HOC que protege rutas del panel admin.
 * Si el usuario no está autenticado, redirige a /admin/login
 * conservando la ruta original en el state para redirigir tras el login.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!adminAuth.isAuthenticated()) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}
