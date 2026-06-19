import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { BackButton, HomeButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import './Payments.css';

const STEPS = { DNI: 'dni', SELECT: 'select', PROCESSING: 'processing', DONE: 'done' };

export default function Payments() {
  const { findUserByDni, addPaymentToUser, updateUser, currentUser, plans } = useApp();
  const [step, setStep] = useState(currentUser ? STEPS.SELECT : STEPS.DNI);
  const [dni, setDni] = useState(currentUser?.dni || '');
  const [user, setUser] = useState(currentUser || null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [error, setError] = useState('');

  const handleDniConfirm = () => {
    if (dni.length < 7) return;
    const found = findUserByDni(dni);
    if (!found) { setError('DNI no encontrado en el sistema.'); return; }
    setUser(found);
    setError('');
    setStep(STEPS.SELECT);
  };

  const handlePay = () => {
    if (!selectedPlan) return;
    setStep(STEPS.PROCESSING);
    setTimeout(() => {
      const plan = plans.find(p => p.id === selectedPlan);
      const today = new Date();
      const vto = new Date(today);
      vto.setDate(vto.getDate() + (plan?.duracionDias || 30));

      const payment = addPaymentToUser(user.id, {
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });

      // Update vencimiento in database
      updateUser(user.id, {
        fechaVencimiento: vto.toISOString().slice(0, 10),
        plan: plan.id,
        habilitado: true
      });
      const newTicket = {
        ...payment,
        nombre: user.nombre,
        dni: user.dni,
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${today.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      };
      setTicket(newTicket);
      setStep(STEPS.DONE);
    }, 2200);
  };

  const handleReset = () => {
    if (currentUser) {
      setStep(STEPS.SELECT);
      setDni(currentUser.dni || '');
      setUser(currentUser);
    } else {
      setStep(STEPS.DNI);
      setDni('');
      setUser(null);
    }
    setSelectedPlan(null);
    setTicket(null);
    setShowTicket(false);
    setError('');
  };

  return (
    <KioskLayout>
      <div className="payments-page page-enter">
        <div className="payments-content">



          {/* Step indicators */}


          {step === STEPS.DNI && (
            <div className="payments-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={handleDniConfirm} maxLength={8} placeholder="Tu DNI" />
              {error && <p className="payments-error">{error}</p>}
              <button className="btn btn-primary btn-xl" style={{ width: 340 }} onClick={handleDniConfirm} disabled={dni.length < 7} id="btn-confirm-dni-payment">
                Continuar
              </button>
            </div>
          )}

          {step === STEPS.SELECT && user && (() => {
            const planSeleccionado = plans.find(p => p.id === selectedPlan);
            return (
              <div className="payments-step anim-fade-in">
                <div className="boton-back">

                <BackButton />

                </div>
                <div className="payments-header">
                  <h1>Pagos</h1>
                </div>

                <div className="payments-user-info">
                  <span>👤</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.nombre}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Socio #{user.id} · DNI {user.dni}</p>
                  </div>
                </div>

                <h3 style={{ textAlign: 'center', marginBottom: 8 }}>Elegí tu plan</h3>
                <div className="plans-grid">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      className={`plan-card ${selectedPlan === plan.id ? 'plan-selected' : ''} ${plan.popular ? 'plan-popular' : ''}`}
                      style={{ '--plan-color': plan.color, cursor: 'pointer' }}
                      onClick={() => setSelectedPlan(plan.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan.id)}
                      id={`btn-plan-${plan.id}`}
                    >

                      <div className="plan-name">{plan.nombre}</div>
                      <div className="plan-price">${(plan.precio || 0).toLocaleString('es-AR')}</div>
                      <div className="plan-duration">{plan.duracionDias || 30} días</div>
                      <ul className="plan-benefits">
                        {(plan.beneficios || []).slice(0, 3).map((b, i) => <li key={i}>✓ {b}</li>)}
                      </ul>
                      {plan.popular && <div className="plan-badge">⭐ MÁS POPULAR</div>}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary btn-xl"
                  style={{ width: '100%', maxWidth: 480 }}
                  onClick={handlePay}
                  disabled={!selectedPlan}
                  id="btn-pay"
                >
                  {planSeleccionado
                    ? `Procesar pago · $${(planSeleccionado.precio || 0).toLocaleString('es-AR')}`
                    : 'Seleccioná un plan'}
                </button>
              </div>
            );
          })()}

          {step === STEPS.PROCESSING && (
            <div className="payments-processing anim-fade-in-scale">
              <div className="processing-animation">
                <div className="processing-ring" />
                <div className="processing-card-icon">💳</div>
              </div>
              <h2>Procesando pago...</h2>
              <p>Aguardá mientras procesamos tu transacción</p>
              <div className="processing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {step === STEPS.DONE && ticket && (
            <div className="payments-done anim-fade-in-scale">
              <div className="done-icon">🎉</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>¡Pago exitoso!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Tu cuota fue acreditada correctamente</p>
              <div className="done-amount">${ticket.monto?.toLocaleString('es-AR')}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary btn-lg btn-grande" onClick={() => setShowTicket(true)} id="btn-show-ticket">
                  Ver ticket
                </button>
                <HomeButton />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Comprobante de pago" maxWidth={420}>
        <Ticket type="payment" data={ticket || {}} onClose={() => setShowTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
