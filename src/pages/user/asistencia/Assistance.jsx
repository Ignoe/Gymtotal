import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { BackButton } from '../../../components/UI/BackButton';
import { useApp } from '../../../context/AppContext';
import './Assistance.css';

const TYPES = [
  { id: 'tecnica',      label: 'Corrección técnica',   icon: '🎯', desc: 'Necesito ayuda con la ejecución de algún ejercicio' },
  { id: 'nueva_rutina', label: 'Nueva rutina',         icon: '📋', desc: 'Quiero que un entrenador me diseñe una rutina nueva' },
  { id: 'lesion',       label: 'Molestia / Lesión',    icon: '🩹', desc: 'Tengo una molestia y necesito orientación' },
  { id: 'general',      label: 'Consulta general',     icon: '💬', desc: 'Tengo una pregunta o necesito asesoramiento' },
];

const STEPS = { DNI: 'dni', TYPE: 'type', CONFIRM: 'confirm', SENT: 'sent' };

export default function Assistance() {
  const { findUserByDni, addAssistanceRequest } = useApp();
  const [step, setStep] = useState(STEPS.DNI);
  const [dni, setDni] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [type, setType] = useState(null);
  const [desc, setDesc] = useState('');

  const handleDni = () => {
    const found = findUserByDni(dni);
    if (!found) { setError('DNI no encontrado.'); return; }
    setUser(found);
    setError('');
    setStep(STEPS.TYPE);
  };

  const handleSend = () => {
    addAssistanceRequest({
      usuarioId: user.id,
      usuarioNombre: user.nombre,
      tipo: type.id,
      descripcion: desc || type.desc,
    });
    setStep(STEPS.SENT);
  };

  const reset = () => {
    setStep(STEPS.DNI);
    setDni('');
    setUser(null);
    setType(null);
    setDesc('');
    setError('');
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

          {step === STEPS.DNI && (
            <div className="assistance-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={handleDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              <button className="btn btn-accent btn-xl" style={{ width: 340 }} onClick={handleDni} disabled={dni.length < 7} id="btn-confirm-dni-assist">
                Continuar
              </button>
            </div>
          )}

          {step === STEPS.TYPE && user && (
            <div className="assistance-step anim-fade-in">
              <div className="assistance-user">👤 {user.nombre}</div>
              <h3 style={{ textAlign: 'center' }}>¿Qué tipo de asistencia necesitás?</h3>
              <div className="assistance-types">
                {TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`assist-type-card ${type?.id === t.id ? 'assist-selected' : ''}`}
                    onClick={() => setType(t)}
                    id={`btn-assist-${t.id}`}
                  >
                    <span className="assist-type-icon">{t.icon}</span>
                    <div>
                      <p style={{ fontWeight: 700 }}>{t.label}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.desc}</p>
                    </div>
                    {type?.id === t.id && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '1.2rem' }}>✓</span>}
                  </button>
                ))}
              </div>

              {type && (
                <div className="assistance-note anim-fade-in">
                  <label className="form-label">Descripción adicional (opcional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Describí tu consulta en más detalle..."
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                  <button className="btn btn-accent btn-lg btn-full" onClick={handleSend} id="btn-send-assist">
                    🆘 Enviar solicitud
                  </button>
                </div>
              )}
            </div>
          )}

          {step === STEPS.SENT && (
            <div className="assistance-sent anim-fade-in-scale">
              <div style={{ fontSize: '5rem', animation: 'floatUp 2s ease-in-out infinite' }}>📣</div>
              <h2>¡Solicitud enviada!</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: 380, textAlign: 'center' }}>
                Un entrenador fue notificado y se acercará a ayudarte en breve. Por favor quedate cerca.
              </p>
              <div className="assistance-sent-info">
                <div>👤 {user?.nombre}</div>
                <div>📋 {type?.label}</div>
                <div className="badge badge-warning anim-pulse">⏳ Pendiente de atención</div>
              </div>
              <button className="btn btn-ghost btn-lg" onClick={reset}>Volver al inicio</button>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
