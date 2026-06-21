import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/UI/StatusBadge';
import { Modal } from '../../../components/UI/Modal';
import './AdminUsers.css';

export default function AdminUsers() {
  const { users, toggleUserStatus, addUser, updateUser, plans } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ nombre: '', dni: '', email: '', telefono: '', plan: 'mensual' });
  const [errors, setErrors] = useState({});

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const match = u.nombre.toLowerCase().includes(q) || u.dni.includes(q) || u.email.toLowerCase().includes(q);
    if (filter === 'habilitados') return match && u.habilitado;
    if (filter === 'inhabilitados') return match && !u.habilitado;
    return match;
  });

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!/^\d{7,8}$/.test(form.dni)) e.dni = 'DNI inválido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const plan = plans.find(p => p.id === form.plan) || { duracionDias: 30 };
    const vto = new Date();
    vto.setDate(vto.getDate() + (plan.duracionDias || 30));
    addUser({ ...form, fechaVencimiento: vto.toISOString().slice(0, 10) });
    setShowAdd(false);
    setForm({ nombre: '', dni: '', email: '', telefono: '', plan: 'mensual' });
  };

  return (
    <div className="admin-users anim-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Gestión de Socios</h1>
          <p>{users.length} socios registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} id="btn-add-user">
          + Nuevo socio
        </button>
      </div>

      <div className="users-toolbar">
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: 320, background:'none' }}
          placeholder="Buscar por nombre, DNI o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="input-search-users"
        />
        <div className="filter-chips">
          {[['todos','Todos'],['habilitados','Habilitados'],['inhabilitados','Inhabilitados']].map(([v,l]) => (
            <button style={{cursor:'pointer'}} key={v} className={`cat-chip ${filter === v ? 'cat-active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="table-wrap" >
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
            {filtered.map(u => {
              const vencido = new Date(u.fechaVencimiento) < new Date();
              return (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{u.nombre}</span>
                      {/* <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</span> */}
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
                    <div style={{ display: 'flex',justifyContent:'center', gap: 8 }}>
                      <button style={{cursor:'pointer'}} className="btn btn-ghost btn-sm" onClick={() => setShowDetail(u)} id={`btn-detail-${u.id}`}>Ver</button>
                      <button style={{cursor:'pointer'}} 
                        className={`btn btn-sm ${u.habilitado ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleUserStatus(u.id)}
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
        {filtered.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Sin resultados.</p>}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Nuevo socio" maxWidth={520}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['nombre','Nombre completo','text'],['dni','DNI','text'],['email','Email','email'],['telefono','Teléfono','text']].map(([k,l,t]) => (
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type={t} className={`form-input ${errors[k] ? 'input-error' : ''}`} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} id={`admin-new-${k}`} />
              {errors[k] && <span style={{ fontSize: '0.78rem', color: 'var(--danger)' }}>{errors[k]}</span>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Plan</label>
            <select className="form-select" value={form.plan} onChange={e => setForm(f => ({...f,plan:e.target.value}))}>
              {plans.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAdd} id="btn-confirm-add-user">Crear socio</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!showDetail} onClose={() => setShowDetail(null)} title="Detalle del socio" maxWidth={540}>
        {showDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem', color:'var(--bg)' }}>{showDetail.nombre[0]}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{showDetail.nombre}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{showDetail.id}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}><StatusBadge status={showDetail.habilitado} /></div>
            </div>
            {[['DNI',showDetail.dni],['Email',showDetail.email],['Teléfono',showDetail.telefono],['Plan',showDetail.plan],['Alta',showDetail.fechaAlta],['Vencimiento',showDetail.fechaVencimiento]].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{l}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{v}</span>
              </div>
            ))}
            <div>
              <p style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.9rem' }}>Historial de pagos ({showDetail.historialPagos?.length || 0})</p>
              {(showDetail.historialPagos || []).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.fecha} — {p.concepto}</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>${p.monto?.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
