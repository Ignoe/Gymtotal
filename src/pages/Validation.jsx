import { useState } from 'react';
import { KioskLayout } from '../components/Layout/KioskLayout';
import { NumericKeypad } from '../components/UI/NumericKeypad';
import { BackButton } from '../components/UI/BackButton';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useApp } from '../context/AppContext';
import './Validation.css';

export default function Validation() {
  const { findUserByDni, setCurrentUser } = useApp();
  const [dni, setDni] = useState('');
  const [result, setResult] = useState(null); // null | 'found' | 'not_found'
  const [user, setUser] = useState(null);

  const handleSearch = () => {
    if (dni.length < 7) return;
    const found = findUserByDni(dni);
    if (found) {
      setUser(found);
      setCurrentUser(found);
      setResult('found');
    } else {
      setUser(null);
      setResult('not_found');
    }
  };

  const handleReset = () => {
    setDni('');
    setResult(null);
    setUser(null);
    setCurrentUser(null);
  };

  const isVencido = (user) => {
    if (!user?.fechaVencimiento) return false;
    return new Date(user.fechaVencimiento) < new Date();
  };

  return (
    <KioskLayout>
      <div className="validation-page page-enter">
        <div className="validation-content">
          <BackButton />

          <div className="validation-header">
            <div className="validation-icon">🪪</div>
            <h1>Validación de Acceso</h1>
            <p>Ingresá tu DNI para verificar tu habilitación</p>
          </div>

          {!result ? (
            <div className="validation-keypad-area">
              <NumericKeypad
                value={dni}
                onChange={setDni}
                onConfirm={handleSearch}
                maxLength={8}
                placeholder="Tu DNI (sin puntos)"
              />
              <button
                className="btn btn-primary btn-xl btn-full"
                style={{ maxWidth: 340 }}
                onClick={handleSearch}
                disabled={dni.length < 7}
                id="btn-validate"
              >
                Verificar acceso
              </button>
            </div>
          ) : (
            <div className="validation-result anim-fade-in-scale">
              {result === 'found' && user ? (
                <div className={`validation-result-card ${user.habilitado && !isVencido(user) ? 'result-ok' : 'result-error'}`}>
                  <div className="result-icon-big">
                    {user.habilitado && !isVencido(user) ? '✅' : '❌'}
                  </div>
                  <h2 className="result-name">{user.nombre}</h2>
                  <p className="result-id">Socio #{user.id}</p>

                  <div className="result-badges">
                    <StatusBadge status={user.habilitado} />
                    <StatusBadge status={user.plan} />
                    {isVencido(user) && <StatusBadge status="vencido" />}
                  </div>

                  <div className="result-details">
                    <div className="result-detail-row">
                      <span>DNI</span><span>{user.dni}</span>
                    </div>
                    <div className="result-detail-row">
                      <span>Vencimiento</span>
                      <span style={{ color: isVencido(user) ? 'var(--danger)' : 'var(--success)' }}>
                        {new Date(user.fechaVencimiento).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="result-detail-row">
                      <span>Email</span><span>{user.email}</span>
                    </div>
                  </div>

                  {user.habilitado && !isVencido(user) ? (
                    <div className="result-message result-message-ok">
                      <span>✓</span> Acceso habilitado — podés ingresar al gimnasio
                    </div>
                  ) : (
                    <div className="result-message result-message-error">
                      <span>✕</span>{' '}
                      {!user.habilitado
                        ? 'Tu cuenta está suspendida. Consultá en recepción.'
                        : 'Tu cuota está vencida. Realizá el pago para acceder.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="validation-result-card result-error">
                  <div className="result-icon-big">🔍</div>
                  <h2>DNI no encontrado</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                    No encontramos un socio con el DNI <strong>{dni}</strong>.
                    Si sos nuevo, usá la opción "Soy Nuevo".
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-ghost btn-lg" onClick={handleReset} id="btn-try-again">
                  Intentar con otro DNI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
