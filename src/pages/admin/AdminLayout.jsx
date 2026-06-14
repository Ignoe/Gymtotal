import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { adminAuth } from '../../middleware/adminAuth';
import './AdminLayout.css';

const NAV = [
  { to: '/admin',             label: 'Dashboard',    icon: '📊', exact: true },
  { to: '/admin/users',       label: 'Socios',       icon: '👥' },
  { to: '/admin/assistance',  label: 'Asistencia',   icon: '🆘' },
  { to: '/admin/payments',    label: 'Pagos',        icon: '💳' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = adminAuth.getSession();

  const handleLogout = () => {
    adminAuth.logout();
    navigate('/validacion');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', color: 'white', fontWeight: 900, padding: '4px 10px', borderRadius: 7, fontSize: '0.95rem' }}>GT</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.08em' }}>GYMTOTAL</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Panel Admin</div>
            </div>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              id={`nav-admin-${n.label.toLowerCase()}`}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">
              {session?.nombre?.[0] || 'A'}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{session?.nombre}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{session?.rol}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm admin-logout" onClick={handleLogout} id="btn-admin-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
