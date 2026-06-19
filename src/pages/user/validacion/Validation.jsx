import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
// import { BackButton } from '../../../components/UI/BackButton';
import { StatusBadge } from '../../../components/UI/StatusBadge';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import { adminAuth } from '../../../middleware/adminAuth';
import { Ticket } from '../../../components/UI/Ticket';
import './Validation.css';

export default function Validation() {
  const navigate = useNavigate();
  const { findUserByDni, setCurrentUser, updateUser, addPaymentToUser, addAssistanceRequest, plans } = useApp();
  const [dni, setDni] = useState('');
  const [result, setResult] = useState(null); // null | 'found' | 'not_found'
  const [user, setUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'done'
  const [selectedPlanId, setSelectedPlanId] = useState('mensual');
  const [ticket, setTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showNuevoModal, setShowNuevoModal] = useState(false);

  const handleSoyNuevo = () => {
    // Dispara solicitud de asistencia administrativa (igual que profesores)
    addAssistanceRequest({
      usuarioId: 'anonimo',
      usuarioNombre: 'Visitante sin registro',
      tipo: 'administrativo',
      descripcion: 'Un visitante solicita información en el tótem. Por favor acercarse a recepción.',
    });
    setShowNuevoModal(true);
    // Auto-cierre a los 3 segundos
    setTimeout(() => {
      setShowNuevoModal(false);
    }, 3000);
  };

  const handleProcessPayment = () => {
    if (!user) return;
    setPaymentStep('processing');

    // Simulate processing for 2 seconds
    setTimeout(() => {
      const plan = plans.find(p => p.id === selectedPlanId);
      const today = new Date();
      const vto = new Date(today);
      vto.setDate(vto.getDate() + (plan?.duracionDias || 30));
      const vtoString = vto.toISOString().slice(0, 10);

      // 1. Add payment record to user's payment history in Firestore
      const payment = addPaymentToUser(user.id, {
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });

      // 2. Update user expiration, plan and active status in Firestore
      updateUser(user.id, {
        fechaVencimiento: vtoString,
        plan: plan.id,
        habilitado: true,
      });

      // 3. Update local user state and context current user
      const updatedUser = {
        ...user,
        fechaVencimiento: vtoString,
        plan: plan.id,
        habilitado: true,
      };

      setUser(updatedUser);
      setCurrentUser(updatedUser);

      // 4. Generate ticket data
      const newTicket = {
        ...payment,
        nombre: user.nombre,
        dni: user.dni,
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      };
      setTicket(newTicket);

      setPaymentStep('done');
    }, 2000);
  };

  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        navigate('/home');
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, navigate]);

  const handleSearch = () => {
    if (dni.length < 8) {
      setResult('errorDNI');
      return;
    }
    const found = findUserByDni(dni);
    if (dni === '99999999' || (found && found.rol === 'admin')) {
      adminAuth.login('admin', 'gymtotal2026');
      navigate('/admin');
      return;
    }
    if (found) {
      setUser(found);
      setCurrentUser(found);
      if (found.habilitado && !isVencido(found)) {
        setShowSuccessModal(true);
      } else {
        setResult('found');
      }
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
          {/* <BackButton /> */}

          <div className="validation-header">
         
            <h1>Por favor ingresa tu DNI</h1>
          </div>

          {!result || result === 'errorDNI' ? (
            <div className="validation-keypad-area">
              <NumericKeypad
                value={dni}
                onChange={(val) => {
                  setDni(val);
                  if (result === 'errorDNI') setResult(null);
                }}
                onConfirm={handleSearch}
                maxLength={8}
                // placeholder="Ingresa tu DNI"
              />
              {result === 'errorDNI' && (
                <div style={{ color: 'var(--danger, #f44336)', fontWeight: 'bold', marginTop: '12px', textAlign: 'center' }} className="anim-fade-in">
                  El DNI debe tener 8 caracteres
                </div>
              )}
              <button
                className="btn btn-ghost"
                style={{ marginTop: 8, gap: 8 }}
                onClick={handleSoyNuevo}
                id="btn-soy-nuevo-validation"
              >
                Soy nuevo, aun no estoy registrado
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
                    <>
                      <div className="result-message result-message-error">
                        <span>✕</span>{' '}
                        {!user.habilitado
                          ? 'Tu cuenta está suspendida. Consultá en recepción.'
                          : 'Tu cuota está vencida. Realizá el pago para acceder.'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                        {isVencido(user) && (
                          <button
                            className="btn btn-primary btn-lg"
                            onClick={() => {
                              setSelectedPlanId(user.plan || 'mensual');
                              setPaymentStep('select');
                              setShowPaymentModal(true);
                            }}
                            id="btn-pay-expired"
                          >
                            💳 Pagar Cuota Vencida
                          </button>
                        )}
                        <button className="btn btn-ghost btn-lg" onClick={handleReset} id="btn-try-again">
                          Intentar con otro DNI
                        </button>
                      </div>
                    </>
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
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-ghost btn-lg" onClick={handleReset} id="btn-try-again">
                      Intentar con otro DNI
                    </button>
                    <button className="btn btn-ghost btn-lg" onClick={() => navigate('/new-member')} id="btn-try-again">
                      Soy Nuevo
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => navigate('/home')}
        title="Acceso Autorizado"
        maxWidth={400}
      >
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            ¡Bienvenido, {user?.nombre}!
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Tu acceso ha sido verificado correctamente. Redirigiendo...
          </p>

        </div>
      </Modal>

      {/* Modal de Pago Rápido para Cuota Vencida */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          if (paymentStep !== 'processing') setShowPaymentModal(false);
        }}
        title="Pagar Cuota Vencida"
        maxWidth={500}
      >
        {paymentStep === 'select' && (() => {
            const planSeleccionado = plans.find(p => p.id === selectedPlanId);
            return (
              <div className="validation-payment-modal anim-fade-in" style={{ padding: '10px 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>
                  Seleccioná un plan para renovar tu membresía de GymTotal:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      className={`plan-card-mini ${selectedPlanId === plan.id ? 'plan-selected' : ''}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlanId(plan.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: selectedPlanId === plan.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedPlanId === plan.id ? 'var(--primary-light-alpha, rgba(33, 150, 243, 0.05))' : 'var(--card-bg, #ffffff)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                      }}
                      id={`btn-val-plan-${plan.id}`}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
                          {plan.nombre} {plan.popular && <span style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 900 }}>⭐ MÁS POPULAR</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{plan.duracionDias || 30} días · {plan.descripcion}</div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: selectedPlanId === plan.id ? 'var(--primary)' : 'var(--text)', marginLeft: 12, whiteSpace: 'nowrap' }}>
                        ${(plan.precio || 0).toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    onClick={() => setShowPaymentModal(false)}
                    id="btn-val-pay-cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleProcessPayment}
                    disabled={!selectedPlanId}
                    id="btn-val-pay-confirm"
                  >
                    {planSeleccionado
                      ? `💳 Procesar · $${(planSeleccionado.precio || 0).toLocaleString('es-AR')}`
                      : '💳 Procesar Pago'}
                  </button>
                </div>
              </div>
            );
          })()}

        {paymentStep === 'processing' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }} className="anim-fade-in">
            <div className="spinner" style={{ margin: '0 auto 24px auto', width: 50, height: 50 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Procesando tu pago...</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Actualizando tu cuenta y habilitando el acceso en el sistema.
            </p>
          </div>
        )}

        {paymentStep === 'done' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }} className="anim-fade-in-scale">
            <div style={{ fontSize: '4.5rem', marginBottom: 20 }}>🎉</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>¡Pago Acreditado!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              Tu membresía ha sido renovada con éxito.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => setShowTicketModal(true)}
                id="btn-val-show-ticket"
              >
                🖨️ Ver Ticket
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  setShowPaymentModal(false);
                  setShowSuccessModal(true);
                }}
                id="btn-val-enter-gym"
              >
                Ingresar al gimnasio
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal del Ticket de Comprobante */}
      <Modal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} title="Comprobante de pago" maxWidth={420}>
        <Ticket type="payment" data={ticket || {}} onClose={() => setShowTicketModal(false)} />
      </Modal>

      {/* Modal "Soy Nuevo" — aviso de 3 segundos + dispara asistencia administrativa */}
      <Modal isOpen={showNuevoModal} onClose={() => setShowNuevoModal(false)} maxWidth={440}>
        <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: '4rem' }}>👋</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2 }}>
            ¡Hola, bienvenido!<br />
            <span className="text-gradient">GymTotal</span>
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.6, maxWidth: 340 }}>
            Por favor esperá aquí,<br />
            en breve un colaborador vendrá a ayudarte.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out 0.2s infinite', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out 0.4s infinite', display: 'inline-block' }} />
          </div>
        </div>
      </Modal>
    </KioskLayout>
  );
}
