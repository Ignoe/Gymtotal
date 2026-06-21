import { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { adminAuth } from '../../middleware/adminAuth';
import { useApp } from '../../context/AppContext';
import './AdminLayout.css';

const NAV = [
  { to: '/admin/assistance',  label: 'Asistencia',   icon: '🆘' },
  { to: '/admin/users',       label: 'Socios',       icon: '👥' },
  { to: '/admin/payments',    label: 'Pagos',        icon: '💳' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = adminAuth.getSession();
  const { assistance } = useApp();

  const pendingCount = (assistance || []).filter(a => a.estado === 'pendiente').length;

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

      <main className="admin-main" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 1000 }}>
          <button 
            className="btn btn-ghost" 
            style={{ 
              position: 'relative', 
              padding: '10px',
              borderRadius: '50%',
              background: 'var(--bg)',
              boxShadow: 'var(--shadow-sm)',
              color: pendingCount > 0 ? 'var(--danger)' : 'var(--text-muted)',
              border: pendingCount > 0 ? '1px solid var(--danger)' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              overflow: 'visible',
              cursor:'pointer'
            }}
            onClick={() => navigate('/admin/assistance')}
            title="Solicitudes de Asistencia"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: 'var(--danger)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 900,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
