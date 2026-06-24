import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { BackButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import './Assistance.css';

const PASOS = { DNI: 'dni', ENVIADO: 'sent' };

let ultimaSolicitud = 0;

export default function Assistance() {
  const { buscarPorDni, agregarSolicitudAsistencia, usuarioActual, asistencias } = useApp();
  const navigate = useNavigate();
  const [paso, setPaso] = useState(PASOS.DNI);
  const [dni, setDni] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [yaFueSolicitada, setYaFueSolicitada] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (usuarioActual && !verificado) {
      const solicitudActiva = asistencias.find(
        a => a.usuarioId === usuarioActual.id && a.estado !== 'atendido'
      );
      if (solicitudActiva) {
        setYaFueSolicitada(true);
      } else {
        const ahora = Date.now();
        if (ahora - ultimaSolicitud > 2000) {
          ultimaSolicitud = ahora;
          agregarSolicitudAsistencia({
            usuarioId: usuarioActual.id,
            usuarioNombre: usuarioActual.nombre,
            tipo: 'general',
            descripcion: 'Solicitud desde el totem',
          });
        }
        setYaFueSolicitada(false);
      }
      setUsuario(usuarioActual);
      setMostrarModal(true);
      setVerificado(true);
    }
  }, [usuarioActual, asistencias, verificado]);

  useEffect(() => {
    if (!mostrarModal) return;
    const timer = setTimeout(() => {
      setMostrarModal(false);
      navigate('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [mostrarModal]);

  const confirmarDni = () => {
    const encontrado = buscarPorDni(dni);
    if (!encontrado) { setError('DNI no encontrado.'); return; }

    const solicitudActiva = asistencias.find(
      a => a.usuarioId === encontrado.id && a.estado !== 'atendido'
    );
    if (solicitudActiva) {
      setYaFueSolicitada(true);
    } else {
      agregarSolicitudAsistencia({
        usuarioId: encontrado.id,
        usuarioNombre: encontrado.nombre,
        tipo: 'general',
        descripcion: 'Solicitud desde el totem',
      });
      setYaFueSolicitada(false);
    }

    setUsuario(encontrado);
    setError('');
    setMostrarModal(true);
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

          {paso === PASOS.DNI && !mostrarModal && (
            <div className="assistance-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={confirmarDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              <button
                className="btn btn-accent btn-xl"
                style={{ width: 340 }}
                onClick={confirmarDni}
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
        isOpen={mostrarModal}
        onClose={() => { setMostrarModal(false); navigate('/home'); }}
        title={yaFueSolicitada ? '' : ''}
        maxWidth={420}
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          {yaFueSolicitada ? (
            <>
              <div style={{ fontSize: '5rem', marginBottom: 16, animation: 'floatUp 2s ease-in-out infinite' }}>⏳</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Aguarda un momento</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                La asistencia ya fue solicitada. Un entrenador se acercará a ayudarte en breve.
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
