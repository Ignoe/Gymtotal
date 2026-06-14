import { useState } from 'react';
import { KioskLayout } from '../components/Layout/KioskLayout';
import { BackButton } from '../components/UI/BackButton';
import { Modal } from '../components/UI/Modal';
import { Ticket } from '../components/UI/Ticket';
import { useApp } from '../context/AppContext';
import plansData from '../data/plans.json';
import './NewMember.css';

const STEPS = { FORM: 'form', PLAN: 'plan', DONE: 'done' };

export default function NewMember() {
  const { addUser } = useApp();
  const [step, setStep] = useState(STEPS.FORM);
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '' });
  const [plan, setPlan] = useState('mensual');
  const [newUser, setNewUser] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!/^\d{7,8}$/.test(form.dni)) e.dni = 'DNI inválido (7-8 dígitos)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    if (!/^\d{10}$/.test(form.telefono)) e.telefono = 'Teléfono inválido (10 dígitos)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(STEPS.PLAN); };

  const handleRegister = () => {
    const selectedPlan = plansData.find(p => p.id === plan);
    const vto = new Date();
    vto.setDate(vto.getDate() + selectedPlan.duracionDias);

    const user = addUser({
      ...form,
      plan,
      fechaVencimiento: vto.toISOString().slice(0, 10),
    });
    setNewUser(user);
    setStep(STEPS.DONE);
  };

  const field = (k, label, type = 'text', ph = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-input ${errors[k] ? 'input-error' : ''}`}
        placeholder={ph}
        value={form[k]}
        onChange={e => { setForm(f => ({ ...f, [k]: e.target.value })); setErrors(er => ({ ...er, [k]: '' })); }}
        id={`input-new-${k}`}
      />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
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

          {step === STEPS.FORM && (
            <div className="newmember-form anim-fade-in">
              <div className="grid-2">
                {field('nombre', 'Nombre completo', 'text', 'Juan Pérez')}
                {field('dni', 'DNI', 'text', '12345678')}
                {field('email', 'Email', 'email', 'juan@ejemplo.com')}
                {field('telefono', 'Teléfono', 'text', '1123456789')}
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleNext} style={{ marginTop: 8 }} id="btn-next-plan">
                Siguiente — elegir plan →
              </button>
            </div>
          )}

          {step === STEPS.PLAN && (
            <div className="newmember-plan anim-fade-in">
              <div className="newmember-user-bar">
                <span>👤 {form.nombre}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(STEPS.FORM)}>← Volver</button>
              </div>
              <h3 style={{ textAlign: 'center' }}>Elegí tu plan</h3>
              <div className="plans-grid-new">
                {plansData.map(p => (
                  <button
                    key={p.id}
                    className={`plan-card-new ${plan === p.id ? 'plan-new-selected' : ''} ${p.popular ? 'plan-popular' : ''}`}
                    style={{ '--pc': p.color }}
                    onClick={() => setPlan(p.id)}
                    id={`btn-newplan-${p.id}`}
                  >
                    {p.popular && <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, marginBottom: 4 }}>⭐ MÁS ELEGIDO</div>}
                    <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{p.nombre}</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--pc)' }}>${p.precio.toLocaleString('es-AR')}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.duracionDias} días</div>
                    <ul style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {p.beneficios.map((b, i) => (
                        <li key={i} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'left' }}>✓ {b}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleRegister} id="btn-register">
                🎉 Completar registro
              </button>
            </div>
          )}

          {step === STEPS.DONE && newUser && (
            <div className="newmember-done anim-fade-in-scale">
              <div style={{ fontSize: '5rem', animation: 'floatUp 2s ease-in-out infinite' }}>🎉</div>
              <h2>¡Ya sos parte de GymTotal!</h2>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Tu cuenta fue creada exitosamente.</p>
              <div className="newmember-card">
                <div className="nm-card-row"><span>N° de socio</span><span style={{ color: 'var(--accent)', fontWeight: 800 }}>{newUser.id}</span></div>
                <div className="nm-card-row"><span>Nombre</span><span>{newUser.nombre}</span></div>
                <div className="nm-card-row"><span>Plan</span><span style={{ textTransform: 'capitalize' }}>{newUser.plan}</span></div>
                <div className="nm-card-row"><span>Válido hasta</span><span>{new Date(newUser.fechaVencimiento).toLocaleDateString('es-AR')}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={() => setShowTicket(true)} id="btn-show-member-ticket">
                  🖨️ Imprimir comprobante
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => { setStep(STEPS.FORM); setForm({ nombre:'',dni:'',email:'',telefono:'' }); setNewUser(null); }}>
                  Registrar otro socio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Comprobante de alta" maxWidth={420}>
        <Ticket type="membership" data={newUser || {}} onClose={() => setShowTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
