import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './KioskLayout.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  // dateStr is YYYY-MM-DD, convert to DD-MM-AAAA avoiding timezone shift
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

export function KioskLayout({ children }) {
  const { currentUser } = useApp();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    update();
    const t = setInterval(update, 1000);
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
          {currentUser && (
            <div className="kiosk-user-status">
              <span className="kiosk-welcome-text">
                Bienvenido, <strong>{currentUser.nombre}. </strong>
              </span>
              <span>Tu pase vence el {formatDate(currentUser.fechaVencimiento)}</span>
            </div>
          )}
          <div className="kiosk-header-right">
            <div className="kiosk-time">{time}</div>
          </div>
        </div>
      </header>
      <main className="kiosk-main">
        {children}
      </main>

    </div>
  );
}
