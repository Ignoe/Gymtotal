import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/UI/StatusBadge';
import { Modal } from '../../../components/UI/Modal';
import './AdminUsers.css';

export default function AdminUsers() {
  const { usuarios, cambiarEstadoUsuario, agregarUsuario, actualizarUsuario, planes } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '', plan: 'mensual' });
  const [errores, setErrores] = useState({});

  const filtrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    const coincide = u.nombre.toLowerCase().includes(q) || u.dni.includes(q) || u.email.toLowerCase().includes(q);
    if (filtro === 'habilitados') return coincide && u.habilitado;
    if (filtro === 'inhabilitados') return coincide && !u.habilitado;
    return coincide;
  });

  const validar = () => {
    const errores = {};
    if (!form.nombre.trim()) errores.nombre = 'Requerido';
    if (!/^\d{7,8}$/.test(form.dni)) errores.dni = 'DNI inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errores.email = 'Email inválido';
    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const agregar = () => {
    if (!validar()) return;
    const plan = planes.find(p => p.id === form.plan) || { duracionDias: 30 };
    const vencimiento = new Date();
    vencimiento.setDate(vencimiento.getDate() + (plan.duracionDias || 30));
    agregarUsuario({ ...form, fechaVencimiento: vencimiento.toISOString().slice(0, 10) });
    setMostrarAgregar(false);
    setForm({ nombre: '', dni: '', email: '', telefono: '', plan: 'mensual' });
  };

  return (
    <div className="admin-users anim-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Gestión de Socios</h1>
          <p>{usuarios.length} socios registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarAgregar(true)} id="btn-add-user">
          + Nuevo socio
        </button>
      </div>

      <div className="users-toolbar">
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: 320, background: 'none' }}
          placeholder="Buscar por nombre, DNI o email..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          id="input-search-users"
        />
        <div className="filter-chips">
          {[['todos', 'Todos'], ['habilitados', 'Habilitados'], ['inhabilitados', 'Inhabilitados']].map(([v, l]) => (
            <button style={{ cursor: 'pointer' }} key={v} className={`cat-chip ${filtro === v ? 'cat-active' : ''}`} onClick={() => setFiltro(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Socio</th>
              <th>DNI</th>
              <th>Plan</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map(u => {
              const vencido = new Date(u.fechaVencimiento) < new Date();
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{u.dni}</td>
                  <td><StatusBadge status={u.plan} /></td>
                  <td style={{ color: vencido ? 'var(--danger)' : 'var(--text)', fontSize: '0.9rem' }}>
                    {new Date(u.fechaVencimiento).toLocaleDateString('es-AR')}
                    {vencido && <span style={{ fontSize: '0.72rem', color: 'var(--danger)', display: 'block' }}>VENCIDO</span>}
                  </td>
                  <td><StatusBadge status={u.habilitado} /></td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <button style={{ cursor: 'pointer' }} className="btn btn-ghost btn-sm" onClick={() => setDetalle(u)} id={`btn-detail-${u.id}`}>Ver</button>
                      <button style={{ cursor: 'pointer' }}
                        className={`btn btn-sm ${u.habilitado ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => cambiarEstadoUsuario(u.id)}
                        id={`btn-toggle-${u.id}`}
                      >
                        {u.habilitado ? 'Inhabilitar' : 'Habilitar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Sin resultados.</p>}
      </div>

      <Modal isOpen={mostrarAgregar} onClose={() => setMostrarAgregar(false)} title="Nuevo socio" maxWidth={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['nombre', 'Nombre completo', 'text'], ['dni', 'DNI', 'text'], ['email', 'Email', 'email'], ['telefono', 'Teléfono', 'text']].map(([k, l, t]) => (
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type={t} className={`form-input ${errores[k] ? 'input-error' : ''}`} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} id={`admin-new-${k}`} />
              {errores[k] && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errores[k]}</span>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-select" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
              {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1, cursor: 'pointer' }} onClick={() => setMostrarAgregar(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 2, cursor: 'pointer' }} onClick={agregar} id="btn-confirm-add-user">Crear socio</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!detalle} onClose={() => setDetalle(null)} title="Detalle del socio" maxWidth={540}>
        {detalle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color: 'var(--bg)' }}>{detalle.nombre[0]}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{detalle.nombre}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{detalle.id}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}><StatusBadge status={detalle.habilitado} /></div>
            </div>
            {[['DNI', detalle.dni], ['Email', detalle.email], ['Teléfono', detalle.telefono], ['Plan', detalle.plan], ['Alta', detalle.fechaAlta], ['Vencimiento', detalle.fechaVencimiento]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{l}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
            <div>
              <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>Historial de pagos ({detalle.historialPagos?.length || 0})</p>
              {(detalle.historialPagos || []).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.fecha} — {p.concepto}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>${p.monto?.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button style={{ cursor: 'pointer' }} className="btn btn-primary" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
