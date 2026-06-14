import { Link, useLocation } from 'react-router-dom';
import './KioskLayout.css';

export function KioskLayout({ children }) {
  return (
    <div className="kiosk-layout bg-mesh">
      <header className="kiosk-header">
        <Link to="/" className="kiosk-brand">
          <div className="kiosk-brand-badge">GT</div>
          <span className="kiosk-brand-name">GYMTOTAL</span>
        </Link>
        <div className="kiosk-header-right">
          <div className="kiosk-time" id="kiosk-clock" />
          <Link to="/admin/login" className="kiosk-admin-link" title="Panel Admin">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 15c3.314 0 6-2.686 6-6S15.314 3 12 3 6 5.686 6 9s2.686 6 6 6z"/>
              <path d="M2.906 18.5c.682-2.75 3.136-4.5 9.094-4.5s8.412 1.75 9.094 4.5"/>
            </svg>
          </Link>
        </div>
      </header>
      <main className="kiosk-main">
        {children}
      </main>
      <footer className="kiosk-footer">
        <span>GymTotal © 2026</span>
        <span className="kiosk-footer-dot">•</span>
        <span>Toca una opción para comenzar</span>
      </footer>
    </div>
  );
}
