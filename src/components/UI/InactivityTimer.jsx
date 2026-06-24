import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';

const TIEMPO_INACTIVIDAD_MS = 30000;

export function InactivityTimer({ children }) {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [cuenta, setCuenta] = useState(10);
  const { setUsuarioActual } = useApp();
  const navigate = useNavigate();

  const timerInactividad = useRef(null);
  const intervalCuenta = useRef(null);

  const reiniciarTimer = useCallback(() => {
    if (mostrarAviso) return;
    if (timerInactividad.current) clearTimeout(timerInactividad.current);

    timerInactividad.current = setTimeout(() => {
      setMostrarAviso(true);
      setCuenta(10);
    }, TIEMPO_INACTIVIDAD_MS);
  }, [mostrarAviso]);

  useEffect(() => {
    const eventos = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    eventos.forEach(ev => window.addEventListener(ev, reiniciarTimer));
    reiniciarTimer();

    return () => {
      eventos.forEach(ev => window.removeEventListener(ev, reiniciarTimer));
      if (timerInactividad.current) clearTimeout(timerInactividad.current);
      if (intervalCuenta.current) clearInterval(intervalCuenta.current);
    };
  }, [reiniciarTimer]);

  const cerrarSesion = useCallback(() => {
    if (timerInactividad.current) clearTimeout(timerInactividad.current);
    if (intervalCuenta.current) clearInterval(intervalCuenta.current);
    setMostrarAviso(false);
    setUsuarioActual(null);
    navigate('/', { replace: true });
  }, [setUsuarioActual, navigate]);

  useEffect(() => {
    if (mostrarAviso) {
      intervalCuenta.current = setInterval(() => {
        setCuenta((prev) => {
          if (prev <= 1) {
            clearInterval(intervalCuenta.current);
            cerrarSesion();
            return 0;
          }
          return prev - 1;
        });
      }, 10000);
    } else {
      if (intervalCuenta.current) clearInterval(intervalCuenta.current);
    }

    return () => {
      if (intervalCuenta.current) clearInterval(intervalCuenta.current);
    };
  }, [mostrarAviso, cerrarSesion]);

  const seguirUsando = () => {
    setMostrarAviso(false);
    reiniciarTimer();
  };

  return (
    <>
      {children}
      <Modal isOpen={mostrarAviso} onClose={cerrarSesion} title="¿Necesitás más tiempo?" maxWidth={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
            Tu sesión se cerrará en <strong style={{color: 'var(--danger)', fontSize: '1.2rem'}}>{cuenta}</strong> segundos.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={cerrarSesion}>
              Salir
            </button>
            <button className="btn btn-primary" style={{background: 'none', color: 'var(--text)'}} onClick={seguirUsando}>
              Sí, necesito más tiempo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
