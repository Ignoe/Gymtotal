import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import './Home.css';

const MENU_ITEMS = [
  // { id: 'validation',  icon: '🪪', label: 'Validación',     sublabel: 'Verificar acceso',      path: '/validation',  color: '#2196F3', glow: 'rgba(33,150,243,0.35)' },
  { id: 'payments',    icon: '💳', label: 'Pagos',           sublabel: 'Pagar cuota',           path: '/payments',    color: '#00BCD4', glow: 'rgba(0,188,212,0.35)'  },
  { id: 'routine',     icon: '🏋️', label: 'Mi Rutina',       sublabel: 'Armar y ver ejercicios', path: '/routine',     color: '#1565C0', glow: 'rgba(21,101,192,0.35)' },
  { id: 'daily-goal',  icon: '🎯', label: 'Objetivo Diario', sublabel: 'Sesión libre',           path: '/daily-goal',  color: '#4DD0E1', glow: 'rgba(77,208,225,0.35)' },
  { id: 'assistance',  icon: '🆘', label: 'Asistencia',      sublabel: 'Llamar al entrenador',  path: '/assistance',  color: '#FF6B35', glow: 'rgba(255,107,53,0.35)' },
  { id: 'new-member',  icon: '👋', label: 'Soy Nuevo',       sublabel: 'Registrarme',           path: '/new-member',  color: '#00E676', glow: 'rgba(0,230,118,0.35)'  },
  { id: 'shop',        icon: '🛍️', label: 'Compras',         sublabel: 'Tienda GymTotal',       path: '/shop',        color: '#E040FB', glow: 'rgba(224,64,251,0.35)' },
  { id: 'ingreso',     icon: '🚪', label: 'Ingreso',         sublabel: 'Habilitar molinete',    path: '/validation',  color: '#fbf540ff', glow: 'rgba(251, 170, 64, 0.35)' },
  // { id: 'admin',       icon: '⚙️', label: 'Panel Admin',     sublabel: 'Gestión interna',       path: '/admin',       color: '#78909C', glow: 'rgba(120,144,156,0.25)' },
];

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Reloj en el header
  useEffect(() => {
    const update = () => {
      const el = document.getElementById('kiosk-clock');
      if (el) {
        el.textContent = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setCurrentUser(null);
    navigate('/');
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        handleCloseSuccess();
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  const handleItemClick = (item) => {
    if (item.id === 'ingreso') {
      setShowSuccessModal(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <KioskLayout>
      <div className="home-page page-enter">
        {/* Background orbs */}
        <div className="bg-orb home-orb-1" />
        <div className="bg-orb home-orb-2" />

        <div className="home-hero">
          <div className="home-hero-badge">Bienvenido al Totem</div>
          <h1 className="home-title">
            ¿Qué querés <span className="text-gradient">hacer hoy?</span>
          </h1>
          <p className="home-subtitle">
            Tocá una opción para comenzar
          </p>
        </div>

        <div className="home-grid">
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.id}
              className="home-card"
              style={{
                '--card-color': item.color,
                '--card-glow': item.glow,
                animationDelay: `${i * 0.06}s`,
              }}
              onClick={() => handleItemClick(item)}
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
          ))}
        </div>
      </div>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={handleCloseSuccess} 
        title="Ingreso Autorizado"
        maxWidth={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            ¡Ingreso Autorizado!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Molinete habilitado. ¡Que tengas un buen entrenamiento{currentUser ? `, ${currentUser.nombre}` : ''}!
          </p>
          <button 
            className="btn btn-primary btn-lg btn-full" 
            onClick={handleCloseSuccess}
          >
            Aceptar
          </button>
        </div>
      </Modal>
    </KioskLayout>
  );
}
