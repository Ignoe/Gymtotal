import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { Modal } from '../../../components/UI/Modal';
import { useApp } from '../../../context/AppContext';
import { adminAuth } from '../../../middleware/adminAuth';
import { Ticket } from '../../../components/UI/Ticket';
import './Validation.css';

const COOLDOWN_NUEVO_MS = 60000;
let ultimoLlamadoNuevo = 0;

export default function Validation() {
  const navigate = useNavigate();
  const { buscarPorDni, setUsuarioActual, actualizarUsuario, agregarPagoAUsuario, agregarSolicitudAsistencia, planes } = useApp();
  const [dni, setDni] = useState('');
  const [resultado, setResultado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [pasoPago, setPasoPago] = useState('select');
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState('mensual');
  const [ticket, setTicket] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEnCamino, setMostrarModalEnCamino] = useState(false);

  const handleSoyNuevo = () => {
    const ahora = Date.now();
    if (ahora - ultimoLlamadoNuevo < COOLDOWN_NUEVO_MS) {
      setMostrarModalEnCamino(true);
      setTimeout(() => setMostrarModalEnCamino(false), 3000);
      return;
    }
    ultimoLlamadoNuevo = ahora;
    agregarSolicitudAsistencia({
      usuarioId: 'anonimo',
      usuarioNombre: 'Visitante sin registro',
      tipo: 'administrativo',
      descripcion: 'Un visitante solicita información en el tótem. Por favor acercarse a recepción.',
    });
    setMostrarModalNuevo(true);
    setTimeout(() => setMostrarModalNuevo(false), 3000);
  };

  const procesarPago = () => {
    if (!usuario) return;
    setPasoPago('processing');
    setTimeout(() => {
      const plan = planes.find(p => p.id === planSeleccionadoId);
      const hoy = new Date();
      const vencimiento = new Date(hoy);
      vencimiento.setDate(vencimiento.getDate() + (plan?.duracionDias || 30));
      const vencimientoStr = vencimiento.toISOString().slice(0, 10);

      const pago = agregarPagoAUsuario(usuario.id, {
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });

      actualizarUsuario(usuario.id, { fechaVencimiento: vencimientoStr, plan: plan.id, habilitado: true });

      const usuarioActualizado = { ...usuario, fechaVencimiento: vencimientoStr, plan: plan.id, habilitado: true };
      setUsuario(usuarioActualizado);
      setUsuarioActual(usuarioActualizado);

      setTicket({
        ...pago,
        nombre: usuario.nombre,
        dni: usuario.dni,
        monto: plan?.precio || 0,
        concepto: `${plan?.nombre || 'Plan'} — ${hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
      });
      setPasoPago('done');
    }, 2000);
  };

  useEffect(() => {
    let timer;
    if (mostrarModalExito) {
      timer = setTimeout(() => navigate('/home'), 1900);
    }
    return () => clearTimeout(timer);
  }, [mostrarModalExito, navigate]);

  const estaVencido = (u) => {
    if (!u?.fechaVencimiento) return false;
    return new Date(u.fechaVencimiento) < new Date();
  };

  const buscar = () => {
    if (dni.length < 8) { setResultado('errorDNI'); return; }
    const encontrado = buscarPorDni(dni);
    if (dni === '99999999' || (encontrado && encontrado.rol === 'admin')) {
      adminAuth.login('admin', 'gymtotal2026');
      navigate('/admin');
      return;
    }
    if (encontrado) {
      setUsuario(encontrado);
      setUsuarioActual(encontrado);
      if (encontrado.habilitado && !estaVencido(encontrado)) {
        setMostrarModalExito(true);
      } else {
        setResultado('found');
      }
    } else {
      setUsuario(null);
      setResultado('not_found');
    }
  };

  const reiniciar = () => {
    setDni('');
    setResultado(null);
    setUsuario(null);
    setUsuarioActual(null);
  };

  return (
    <KioskLayout>
      <div className="validation-page page-enter">
        <div className="validation-content">
          {!resultado || resultado === 'errorDNI' ? (
            <>
              <div className="validation-header">
                <h1>Por favor ingresá tu DNI</h1>
              </div>
              <div className="validation-keypad-area">
                <NumericKeypad
                  value={dni}
                  onChange={(val) => { setDni(val); if (resultado === 'errorDNI') setResultado(null); }}
                  onConfirm={buscar}
                  maxLength={8}
                />
                {resultado === 'errorDNI' && (
                  <div style={{ color: 'var(--danger, #f44336)', fontWeight: 'bold', marginTop: '12px', textAlign: 'center' }} className="anim-fade-in">
                    El DNI debe tener 8 caracteres
                  </div>
                )}
                <button className="btn btn-ghost" style={{ marginTop: 8, gap: 8 }} onClick={handleSoyNuevo} id="btn-soy-nuevo-validation">
                  Soy nuevo, aún no estoy registrado
                </button>
              </div>
            </>
          ) : (
            <div className="validation-result anim-fade-in-scale">
              {resultado === 'found' && usuario ? (
                <div className={`validation-result-card ${usuario.habilitado && !estaVencido(usuario) ? 'result-ok' : 'result-error'}`}>
                  <div className="result-icon-big">{usuario.habilitado && !estaVencido(usuario) ? '✅' : ''}</div>
                  <h2 className="result-name">{usuario.nombre}</h2>
                  <p className="result-id">Socio #{usuario.id}</p>
                  <div className="result-details">
                    <div className="result-detail-row"><span>DNI</span><span>{usuario.dni}</span></div>
                    <div className="result-detail-row">
                      <span>Vencimiento</span>
                      <span style={{ color: estaVencido(usuario) ? 'var(--danger)' : 'var(--success)' }}>
                        {new Date(usuario.fechaVencimiento).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    <div className="result-detail-row"><span>Email</span><span>{usuario.email}</span></div>
                  </div>
                  {usuario.habilitado && !estaVencido(usuario) ? (
                    <div className="result-message result-message-ok"><span>✓</span> Acceso habilitado — podés ingresar al gimnasio</div>
                  ) : (
                    <>
                      <div className="result-message result-message-error">
                        <span>✕</span>{' '}
                        {!usuario.habilitado ? 'Tu cuenta está suspendida. Consultá en recepción.' : 'Tu cuota está vencida. Realizá el pago para acceder.'}
                      </div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                        {estaVencido(usuario) && (
                          <button className="btn btn-primary btn-lg" onClick={() => { setPlanSeleccionadoId(usuario.plan || 'mensual'); setPasoPago('select'); setMostrarModalPago(true); }} id="btn-pay-expired">
                            Pagar Cuota Vencida
                          </button>
                        )}
                        <button className="btn btn-ghost btn-lg" onClick={reiniciar} id="btn-try-again">Intentar con otro DNI</button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="validation-result-card result-error">
                  <h2>DNI no encontrado</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                    No encontramos un socio con el DNI <strong>{dni}</strong>. Si sos nuevo, usá la opción "Soy Nuevo".
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-ghost btn-lg" onClick={reiniciar} id="btn-try-again">Intentar con otro DNI</button>
                    <button className="btn btn-ghost btn-lg" onClick={() => navigate('/new-member')} id="btn-go-new-member">Soy Nuevo</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mostrarModalExito} onClose={() => navigate('/home')} title="Acceso Autorizado" maxWidth={400}>
        <div style={{ textAlign: 'center', padding: '20px 10px' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>¡Bienvenido, {usuario?.nombre}!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Tu acceso ha sido verificado. Redirigiendo...</p>
        </div>
      </Modal>

      <Modal isOpen={mostrarModalPago} onClose={() => { if (pasoPago !== 'processing') setMostrarModalPago(false); }} title="Pagar Cuota Vencida" maxWidth={500}>
        {pasoPago === 'select' && (() => {
          const planActual = planes.find(p => p.id === planSeleccionadoId);
          return (
            <div className="validation-payment-modal anim-fade-in" style={{ padding: '10px 0' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center' }}>Seleccioná un plan para renovar tu membresía de GymTotal:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {planes.map((plan) => (
                  <div key={plan.id} role="button" tabIndex={0}
                    className={`plan-card-mini ${planSeleccionadoId === plan.id ? 'plan-selected' : ''}`}
                    onClick={() => setPlanSeleccionadoId(plan.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setPlanSeleccionadoId(plan.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, border: planSeleccionadoId === plan.id ? '2px solid var(--primary)' : '1px solid var(--border)', background: planSeleccionadoId === plan.id ? 'rgba(33, 150, 243, 0.05)' : 'var(--card-bg, #ffffff)', textAlign: 'left', width: '100%', transition: 'all 0.2s ease', boxSizing: 'border-box' }}
                    id={`btn-val-plan-${plan.id}`}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>
                        {plan.nombre} {plan.popular && <span style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 900 }}>⭐ MÁS POPULAR</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{plan.duracionDias || 30} días · {plan.descripcion}</div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem', color: planSeleccionadoId === plan.id ? 'var(--primary)' : 'var(--text)', marginLeft: 12, whiteSpace: 'nowrap' }}>
                      ${(plan.precio || 0).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setMostrarModalPago(false)} id="btn-val-pay-cancel">Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={procesarPago} disabled={!planSeleccionadoId} id="btn-val-pay-confirm">
                  {planActual ? `💳 Procesar · $${(planActual.precio || 0).toLocaleString('es-AR')}` : '💳 Procesar Pago'}
                </button>
              </div>
            </div>
          );
        })()}

        {pasoPago === 'processing' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }} className="anim-fade-in">
            <div className="spinner" style={{ margin: '0 auto 24px auto', width: 50, height: 50 }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Procesando tu pago...</h3>
            <p style={{ color: 'var(--text-muted)' }}>Actualizando tu cuenta y habilitando el acceso en el sistema.</p>
          </div>
        )}

        {pasoPago === 'done' && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }} className="anim-fade-in-scale">
            <div style={{ fontSize: '4.5rem', marginBottom: 20 }}>🎉</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>¡Pago Acreditado!</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Tu membresía ha sido renovada con éxito.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-lg" onClick={() => setMostrarTicket(true)} id="btn-val-show-ticket">Ver Ticket</button>
              <button className="btn btn-primary btn-lg" onClick={() => { setMostrarModalPago(false); setMostrarModalExito(true); }} id="btn-val-enter-gym">Ir a pantalla principal</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={mostrarTicket} onClose={() => setMostrarTicket(false)} title="Comprobante de pago" maxWidth={420}>
        <Ticket type="payment" data={ticket || {}} onClose={() => setMostrarTicket(false)} />
      </Modal>

      <Modal isOpen={mostrarModalNuevo} onClose={() => setMostrarModalNuevo(false)} maxWidth={440}>
        <div style={{ textAlign: 'center', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <h1><span className="text-gradient">GymTotal</span></h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.2 }}>¡Hola, bienvenido!<br /></h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 500, lineHeight: 1.6, maxWidth: 340 }}>
              Por favor esperá aquí,<br />en breve un colaborador vendrá a ayudarte.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out 0.2s infinite', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary-light)', animation: 'pulse 1.2s ease-in-out 0.4s infinite', display: 'inline-block' }} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={mostrarModalEnCamino} onClose={() => setMostrarModalEnCamino(false)} maxWidth={420}>
        <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>La asistencia está en camino</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, maxWidth: 320 }}>
            Por favor aguardá, ya avisamos a un colaborador y se acercará en breve.
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.2s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.2s ease-in-out 0.2s infinite', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.2s ease-in-out 0.4s infinite', display: 'inline-block' }} />
          </div>
        </div>
      </Modal>
    </KioskLayout>
  );
}
