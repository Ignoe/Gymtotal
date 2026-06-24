import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import './Home.css';

const OPCIONES_MENU = [
  { id: 'payments',   label: 'Pagos',           sublabel: 'Pagá tu cuota',                     path: '/payments' },
  { id: 'routine',    label: 'Mi Rutina',       sublabel: 'Administrá tu rutina',              path: '/routine' },
  { id: 'daily-goal', label: 'Objetivo Diario', sublabel: 'Elegí tu objetivo de hoy',          path: '/daily-goal' },
  { id: 'assistance', label: 'Asistencia',      sublabel: 'Solicitá la ayuda del entrenador',  path: '/assistance' },
  { id: 'shop',       label: 'Compras',         sublabel: 'Tienda GymTotal',                   path: '/shop' },
  { id: 'salir',      label: 'Salir',           sublabel: 'Cerrar sesión',                     path: '/' },
  { id: 'ingreso',    label: 'Ingreso',         sublabel: ' ',                                 path: '/validation' },
];

export default function Home() {
  const navigate = useNavigate();
  const { usuarioActual, setUsuarioActual } = useApp();
  const [mostrarModalIngreso, setMostrarModalIngreso] = useState(false);

  const cerrarModalIngreso = () => {
    setMostrarModalIngreso(false);
    setUsuarioActual(null);
    navigate('/');
  };

  useEffect(() => {
    let timer;
    if (mostrarModalIngreso) {
      timer = setTimeout(cerrarModalIngreso, 3500);
    }
    return () => clearTimeout(timer);
  }, [mostrarModalIngreso]);

  const handleClick = (item) => {
    if (item.id === 'ingreso') {
      setMostrarModalIngreso(true);
    } else if (item.id === 'salir') {
      setUsuarioActual(null);
      navigate('/');
    } else {
      navigate(item.path);
    }
  };

  const opcionesPrincipales = OPCIONES_MENU.filter(item => item.id !== 'ingreso');
  const opcionIngreso = OPCIONES_MENU.find(item => item.id === 'ingreso');

  const renderTarjeta = (item, index) => (
    <button
      key={item.id}
      className="home-card"
      style={{ '--card-color': item.color, '--card-glow': item.glow, animationDelay: `${index * 0.06}s` }}
      onClick={() => handleClick(item)}
      id={`kiosk-btn-${item.id}`}
    >
      <div className="home-card-icon">{item.icon}</div>
      <div className="home-card-body">
        <span className="home-card-label">{item.label}</span>
        <span className="home-card-sublabel">{item.sublabel}</span>
      </div>
      <div className="home-card-arrow">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
      <div className="home-card-bg" />
    </button>
  );

  return (
    <KioskLayout>
      <div className="home-page page-enter">
        <div className="bg-orb home-orb-1" />
        <div className="bg-orb home-orb-2" />

        <div className="home-hero">
          <h1 className="home-title">¿Qué querés <span className="text-gradient">hacer hoy?</span></h1>
        </div>

        <div className="home-grid-container">
          <div className="home-grid">
            {opcionesPrincipales.map((item, i) => renderTarjeta(item, i))}
          </div>
          {opcionIngreso && (
            <div className="home-footer-action">
              {renderTarjeta(opcionIngreso, opcionesPrincipales.length)}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mostrarModalIngreso} onClose={cerrarModalIngreso} title="Ingreso Autorizado" maxWidth={400}>
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>¡Ingreso Autorizado!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Molinete habilitado. ¡Que tengas un buen entrenamiento{usuarioActual ? `, ${usuarioActual.nombre}` : ''}!
          </p>
        </div>
      </Modal>
    </KioskLayout>
  );
}
