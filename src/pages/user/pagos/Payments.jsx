import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { BackButton, HomeButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import './Payments.css';

const PASOS = { DNI: 'dni', SELECCION: 'select', PROCESANDO: 'processing', LISTO: 'done' };

function tieneCoberturaVigente(usuario) {
  if (!usuario?.fechaVencimiento) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(usuario.fechaVencimiento + 'T00:00:00');
  const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
  return diasRestantes > 3;
}

function formatearFechaVencimiento(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Payments() {
  const { buscarPorDni, agregarPagoAUsuario, actualizarUsuario, usuarioActual, planes } = useApp();
  const [paso, setPaso] = useState(usuarioActual ? PASOS.SELECCION : PASOS.DNI);
  const [dni, setDni] = useState(usuarioActual?.dni || '');
  const [usuario, setUsuario] = useState(usuarioActual || null);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [error, setError] = useState('');
  const [mostrarModalCobertura, setMostrarModalCobertura] = useState(false);

  const confirmarDni = () => {
    if (dni.length < 7) return;
    const encontrado = buscarPorDni(dni);
    if (!encontrado) { setError('DNI no encontrado en el sistema.'); return; }
    setUsuario(encontrado);
    setError('');
    setPaso(PASOS.SELECCION);
  };

  const pagar = () => {
    if (!planSeleccionado) return;
    if (tieneCoberturaVigente(usuario)) {
      setMostrarModalCobertura(true);
      return;
    }
    setPaso(PASOS.PROCESANDO);
    setTimeout(() => {
      const plan = planes.find(p => p.id === planSeleccionado);
      const hoy = new Date();
      const vencimiento = new Date(hoy);
      vencimiento.setDate(vencimiento.getDate() + (plan?.duracionDias || 30));

      const pago = agregarPagoAUsuario(usuario.id, {
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });

      actualizarUsuario(usuario.id, {
        fechaVencimiento: vencimiento.toISOString().slice(0, 10),
        plan: plan.id,
        habilitado: true
      });

      setTicket({
        ...pago,
        nombre: usuario.nombre,
        dni: usuario.dni,
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });
      setPaso(PASOS.LISTO);
    }, 2200);
  };

  const reiniciar = () => {
    if (usuarioActual) {
      setPaso(PASOS.SELECCION);
      setDni(usuarioActual.dni || '');
      setUsuario(usuarioActual);
    } else {
      setPaso(PASOS.DNI);
      setDni('');
      setUsuario(null);
    }
    setPlanSeleccionado(null);
    setTicket(null);
    setMostrarTicket(false);
    setError('');
  };

  return (
    <KioskLayout>
      <div className="payments-page page-enter">
        <div className="payments-content">

          {paso === PASOS.DNI && (
            <div className="payments-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={confirmarDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p className="payments-error">{error}</p>}
              <button className="btn btn-primary btn-xl" style={{ width: 340 }} onClick={confirmarDni} disabled={dni.length < 7} id="btn-confirm-dni-payment">
                Continuar
              </button>
            </div>
          )}

          {paso === PASOS.SELECCION && usuario && (() => {
            const planActual = planes.find(p => p.id === planSeleccionado);
            return (
              <div className="payments-step anim-fade-in">
                <div className="boton-back"><BackButton /></div>
                <div className="payments-header"><h1>Pagos</h1></div>

                <div className="payments-user-info">
                  <span>👤</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{usuario.nombre}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Socio #{usuario.id} · DNI {usuario.dni}</p>
                  </div>
                </div>

                <h3 style={{ textAlign: 'center', marginBottom: 8 }}>Elegí tu plan</h3>
                <div className="plans-grid">
                  {planes.map((plan) => (
                    <div
                      key={plan.id}
                      role="button"
                      tabIndex={0}
                      className={`plan-card ${planSeleccionado === plan.id ? 'plan-selected' : ''} ${plan.popular ? 'plan-popular' : ''}`}
                      style={{ '--plan-color': plan.color }}
                      onClick={() => setPlanSeleccionado(plan.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setPlanSeleccionado(plan.id)}
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
                  onClick={pagar}
                  disabled={!planSeleccionado}
                  id="btn-pay"
                >
                  {planActual ? `Procesar pago · $${(planActual.precio || 0).toLocaleString('es-AR')}` : 'Seleccioná un plan'}
                </button>
              </div>
            );
          })()}

          {paso === PASOS.PROCESANDO && (
            <div className="payments-processing anim-fade-in-scale">
              <div className="processing-animation">
                <div className="processing-ring" />
                <div className="processing-card-icon">💳</div>
              </div>
              <h2>Procesando pago...</h2>
              <p>Aguardá mientras procesamos tu transacción</p>
              <div className="processing-dots"><span /><span /><span /></div>
            </div>
          )}

          {paso === PASOS.LISTO && ticket && (
            <div className="payments-done anim-fade-in-scale">
              <div className="done-icon">🎉</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>¡Pago exitoso!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Tu cuota fue acreditada correctamente</p>
              <div className="done-amount">${ticket.monto?.toLocaleString('es-AR')}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary btn-lg btn-grande" onClick={() => setMostrarTicket(true)} id="btn-show-ticket">Ver ticket</button>
                <HomeButton />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mostrarTicket} onClose={() => setMostrarTicket(false)} title="Comprobante de pago" maxWidth={420}>
        <Ticket type="payment" data={ticket || {}} onClose={() => setMostrarTicket(false)} />
      </Modal>

      <Modal isOpen={mostrarModalCobertura} onClose={() => setMostrarModalCobertura(false)} title="" maxWidth={480}>
        <div className="coverage-modal-body">


          <p className="coverage-modal-text">Actualmente contás con un plan vigente que vence el día</p>
          <p className="coverage-modal-date">{formatearFechaVencimiento(usuario?.fechaVencimiento)}</p>
          <p className="coverage-modal-text">Podras renovarlo cuando falten 3 o menos días para su vencimiento.</p>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} onClick={() => setMostrarModalCobertura(false)} id="btn-coverage-close">
            Entendido
          </button>
        </div>
      </Modal>
    </KioskLayout>
  );
}
