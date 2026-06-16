import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import './Home.css';

const MENU_ITEMS = [
   { id: 'payments',    label: 'Pagos',           sublabel: 'Pagar cuota',           path: '/payments',    color: '#00BCD4', glow: 'rgba(0,188,212,0.35)'  },
  { id: 'routine',     label: 'Mi Rutina',       sublabel: 'Armar y ver ejercicios', path: '/routine',     color: '#1565C0', glow: 'rgba(21,101,192,0.35)' },
  { id: 'daily-goal',  label: 'Objetivo Diario', sublabel: 'Sesión libre',           path: '/daily-goal',  color: '#4DD0E1', glow: 'rgba(77,208,225,0.35)' },
  { id: 'assistance',  label: 'Asistencia',      sublabel: 'Llamar al entrenador',  path: '/assistance',  color: '#FF6B35', glow: 'rgba(255,107,53,0.35)' },
  { id: 'shop',        label: 'Compras',         sublabel: 'Tienda GymTotal',       path: '/shop',        color: '#E040FB', glow: 'rgba(224,64,251,0.35)' },
  { id: 'salir',        label: 'Salir',           sublabel: 'Cerrar sesión',         path: '/',            color: '#FF5252', glow: 'rgba(255, 82, 82, 0.35)' },
  { id: 'ingreso',     label: 'Ingreso',         sublabel: ' ',    path: '/validation',  color: '#fbf540ff', glow: 'rgba(251, 170, 64, 0.35)' },
 
];

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);


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
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal]);

  const handleItemClick = (item) => {
    if (item.id === 'ingreso') {
      setShowSuccessModal(true);
    } else if (item.id === 'salir') {
      setCurrentUser(null);
      navigate('/');
    } else {
      navigate(item.path);
    }
  };

  const mainItems = MENU_ITEMS.filter(item => item.id !== 'ingreso');
  const ingresoItem = MENU_ITEMS.find(item => item.id === 'ingreso');

  const renderCard = (item, index) => (
    <button
      key={item.id}
      className="home-card"
      style={{
        '--card-color': item.color,
        '--card-glow': item.glow,
        animationDelay: `${index * 0.06}s`,
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
  );

  return (
    <KioskLayout>
      <div className="home-page page-enter">
        {/* Background orbs */}
        <div className="bg-orb home-orb-1" />
        <div className="bg-orb home-orb-2" />

        <div className="home-hero">
         
          <h1 className="home-title">
            ¿Qué querés <span className="text-gradient">hacer hoy?</span>
          </h1>
       
        </div>

        <div className="home-grid-container">
          <div className="home-grid">
            {mainItems.map((item, i) => renderCard(item, i))}
          </div>
          {ingresoItem && (
            <div className="home-footer-action">
              {renderCard(ingresoItem, mainItems.length)}
            </div>
          )}
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
        
        </div>
      </Modal>
    </KioskLayout>
  );
}
