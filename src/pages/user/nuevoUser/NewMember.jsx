import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import './NewMember.css';

const PASOS = { FORM: 'form', PLAN: 'plan', LISTO: 'done' };

export default function NewMember() {
  const { agregarUsuario, planes } = useApp();
  const [paso, setPaso] = useState(PASOS.FORM);
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '' });
  const [planId, setPlanId] = useState('mensual');
  const [nuevoSocio, setNuevoSocio] = useState(null);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!/^\d{7,8}$/.test(form.dni)) e.dni = 'DNI inválido (7-8 dígitos)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'Teléfono inválido (10 dígitos)';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const siguiente = () => { if (validar()) setPaso(PASOS.PLAN); };

  const registrar = () => {
    const planSeleccionado = planes.find(p => p.id === planId);
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + (planSeleccionado?.duracionDias || 30));

    const socio = agregarUsuario({
      ...form,
      plan: planId,
      fechaVencimiento: vencimiento.toISOString().slice(0, 10),
    });
    setNuevoSocio(socio);
    setPaso(PASOS.LISTO);
  };

  const campo = (k, label, tipo = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={tipo}
        className={`form-input ${errores[k] ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={form[k]}
        onChange={e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrores(er => ({ ...er, [k]: '' })); }}
        id={`input-new-${k}`}
      />
      {errores[k] && <span className="field-error">{errores[k]}</span>}
    </div>
  );

  return (
    <KioskLayout>
      <div className="newmember-page page-enter">
        <div className="newmember-content">
          <BackButton />

          <div className="newmember-header">
            <div style={{ fontSize: '3rem' }}>👋</div>
            <h1>¡Bienvenido!</h1>
            <p>Registrate como nuevo socio de GymTotal</p>
          </div>

          {paso === PASOS.FORM && (
            <div className="newmember-form anim-fade-in">
              <div className="grid-2">
                {campo('nombre', 'Nombre completo', 'text', 'Juan Pérez')}
                {campo('dni', 'DNI', 'text', '12345678')}
                {campo('email', 'Email', 'email', 'juan@ejemplo.com')}
                {campo('telefono', 'Teléfono', 'text', '1123456789')}
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={siguiente} style={{ marginTop: 8 }} id="btn-next-plan">
                Siguiente — elegir plan →
              </button>
            </div>
          )}

          {paso === PASOS.PLAN && (
            <div className="newmember-plan anim-fade-in">
              <div className="newmember-user-bar">
                <span>👤 {form.nombre}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPaso(PASOS.FORM)}>← Volver</button>
              </div>
              <h3 style={{ textAlign: 'center' }}>Elegí tu plan</h3>
              <div className="plans-grid-new">
                {planes.map(p => (
                  <button
                    key={p.id}
                    className={`plan-card-new ${planId === p.id ? 'plan-new-selected' : ''} ${p.popular ? 'plan-popular' : ''}`}
                    style={{ '--pc': p.color }}
                    onClick={() => setPlanId(p.id)}
                    id={`btn-newplan-${p.id}`}
                  >
                    {p.popular && <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, marginBottom: 4 }}>⭐ MÁS ELEGIDO</div>}
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{p.nombre}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--pc)' }}>${(p.precio || 0).toLocaleString('es-AR')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.duracionDias || 30} días</div>
                    <ul style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {(p.beneficios || []).map((b, i) => (
                        <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'left' }}>✓ {b}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={registrar} id="btn-register">
                🎉 Completar registro
              </button>
            </div>
          )}

          {paso === PASOS.LISTO && nuevoSocio && (
            <div className="newmember-done anim-fade-in-scale">
              <div style={{ fontSize: '5rem', animation: 'floatUp 2s ease-in-out infinite' }}>🎉</div>
              <h2>¡Ya sos parte de GymTotal!</h2>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Tu cuenta fue creada exitosamente.</p>
              <div className="newmember-card">
                <div className="nm-card-row"><span>N° de socio</span><span style={{ color: 'var(--accent)', fontWeight: 800 }}>{nuevoSocio.id}</span></div>
                <div className="nm-card-row"><span>Nombre</span><span>{nuevoSocio.nombre}</span></div>
                <div className="nm-card-row"><span>Plan</span><span style={{ textTransform: 'capitalize' }}>{nuevoSocio.plan}</span></div>
                <div className="nm-card-row"><span>Válido hasta</span><span>{new Date(nuevoSocio.fechaVencimiento).toLocaleDateString('es-AR')}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={() => setMostrarTicket(true)} id="btn-show-member-ticket">
                  🖨️ Imprimir comprobante
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => { setPaso(PASOS.FORM); setForm({ nombre: '', dni: '', email: '', telefono: '' }); setNuevoSocio(null); }}>
                  Registrar otro socio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mostrarTicket} onClose={() => setMostrarTicket(false)} title="Comprobante de alta" maxWidth={420}>
        <Ticket type="membership" data={nuevoSocio || {}} onClose={() => setMostrarTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
