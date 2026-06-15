import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { BackButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import './Assistance.css';

const STEPS = { DNI: 'dni', SENT: 'sent' };

let lastRequestTime = 0;

export default function Assistance() {
  const { findUserByDni, addAssistanceRequest, currentUser, assistance } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.DNI);
  const [dni, setDni] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isAlreadyRequested, setIsAlreadyRequested] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Si hay sesión activa, enviar solicitud automáticamente al entrar
  useEffect(() => {
    if (currentUser && !hasChecked) {
      const activeRequest = assistance.find(
        a => a.usuarioId === currentUser.id && a.estado !== 'atendido'
      );
      if (activeRequest) {
        setIsAlreadyRequested(true);
      } else {
        const now = Date.now();
        if (now - lastRequestTime > 2000) {
          lastRequestTime = now;
          addAssistanceRequest({
            usuarioId: currentUser.id,
            usuarioNombre: currentUser.nombre,
            tipo: 'general',
            descripcion: 'Solicitud desde el totem',
          });
        }
        setIsAlreadyRequested(false);
      }
      setUser(currentUser);
      setShowModal(true);
      setHasChecked(true);
    }
  }, [currentUser, assistance, hasChecked]);

  // Auto-cerrar modal y volver al home tras 3 segundos
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(() => {
      setShowModal(false);
      navigate('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [showModal]);

  const handleDni = () => {
    const found = findUserByDni(dni);
    if (!found) { setError('DNI no encontrado.'); return; }
    
    const activeRequest = assistance.find(
      a => a.usuarioId === found.id && a.estado !== 'atendido'
    );
    if (activeRequest) {
      setIsAlreadyRequested(true);
    } else {
      addAssistanceRequest({
        usuarioId: found.id,
        usuarioNombre: found.nombre,
        tipo: 'general',
        descripcion: 'Solicitud desde el totem',
      });
      setIsAlreadyRequested(false);
    }
    
    setUser(found);
    setError('');
    setShowModal(true);
  };

  return (
    <KioskLayout>
      <div className="assistance-page page-enter">
        <div className="assistance-content">
          <BackButton />

          <div className="assistance-header">
            <div style={{ fontSize: '3rem' }}>🆘</div>
            <h1>Solicitar Asistencia</h1>
            <p>Un entrenador se acercará a ayudarte</p>
          </div>

          {step === STEPS.DNI && !showModal && (
            <div className="assistance-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={handleDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              <button
                className="btn btn-accent btn-xl"
                style={{ width: 340 }}
                onClick={handleDni}
                disabled={dni.length < 7}
                id="btn-confirm-dni-assist"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); navigate('/home'); }}
        title={isAlreadyRequested ? "Asistencia pendiente" : "¡Asistencia solicitada!"}
        maxWidth={420}
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          {isAlreadyRequested ? (
            <>
              <div style={{ fontSize: '5rem', marginBottom: 16, animation: 'floatUp 2s ease-in-out infinite' }}>⏳</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Aguarda un momento</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Aguarda, la asistencia ya ha sido solicitada. Un entrenador se acercará a ayudarte en breve.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '5rem', marginBottom: 16, animation: 'floatUp 2s ease-in-out infinite' }}>📣</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>¡Solicitud enviada!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                Un entrenador fue notificado y se acercará a ayudarte en breve. Por favor quedate cerca.
              </p>
            </>
          )}
        </div>
      </Modal>
    </KioskLayout>
  );
}
