import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InactivityTimer } from '../components/UI/InactivityTimer';

/**
 * UserProtectedRoute — HOC que protege rutas del kiosco que requieren un socio autenticado.
 * Si no hay `currentUser`, redirige automáticamente a la pantalla de validación (/).
 */
export function UserProtectedRoute({ children }) {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <InactivityTimer>
      {children}
    </InactivityTimer>
  );
}
