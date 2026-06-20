import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';

export function InactivityTimer({ children }) {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const idleTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const IDLE_TIMEOUT_MS = 30000; // 30 segundos

  const resetIdleTimer = useCallback(() => {
    if (showWarning) return; // No reiniciar si ya se está mostrando el modal
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

    idleTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(10);
    }, IDLE_TIMEOUT_MS);
  }, [showWarning]);

  const handleUserActivity = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  useEffect(() => {
    // Escuchar eventos de actividad del usuario
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    // Inicio inicial
    resetIdleTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [handleUserActivity]);

  const logout = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowWarning(false);
    setCurrentUser(null);
    navigate('/', { replace: true });
  }, [setCurrentUser, navigate]);

  useEffect(() => {
    if (showWarning) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            logout(); // Tiempo terminado, cerrar sesión
            return 0;
          }
          return prev - 1;
        });
      }, 10000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning, logout]);

  const handleExtendSession = () => {
    setShowWarning(false);
    resetIdleTimer();
  };

  return (
    <>
      {children}
      <Modal isOpen={showWarning} onClose={logout} title="¿Necesitás más tiempo?" maxWidth={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '16px 0' }}>
          {/* <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div> */}
          <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
            Tu sesión se cerrará en <strong style={{color: 'var(--danger)', fontSize: '1.2rem'}}>{countdown}</strong> segundos.
          </p>
         
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={logout}>
              Salir
            </button>
            <button className="btn btn-primary" style={{background: 'none', color: 'var(--text)'}} onClick={handleExtendSession}>
              Sí, necesito más tiempo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
