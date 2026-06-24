import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './KioskLayout.css';

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const [y, m, d] = fechaStr.split('-');
  return `${d}-${m}-${y}`;
}

export function KioskLayout({ children }) {
  const { usuarioActual } = useApp();
  const [hora, setHora] = useState('');

  useEffect(() => {
    const actualizar = () =>
      setHora(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    actualizar();
    const t = setInterval(actualizar, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="kiosk-layout bg-mesh">
      <header className="kiosk-header">
        <div className="kiosk-brand">
          <div className="kiosk-brand-badge">GT</div>
          <span className="kiosk-brand-name">GYMTOTAL</span>
        </div>
        <div className='kiosk-user'>
          {usuarioActual && (
            <div className="kiosk-user-status">
              <span className="kiosk-welcome-text">
                Bienvenido, <strong>{usuarioActual.nombre}. </strong>
              </span>
              <span>Tu pase vence el {formatearFecha(usuarioActual.fechaVencimiento)}</span>
            </div>
          )}
          <div className="kiosk-header-right">
            <div className="kiosk-time">{hora}</div>
          </div>
        </div>
      </header>
      <main className="kiosk-main">
        {children}
      </main>
    </div>
  );
}
