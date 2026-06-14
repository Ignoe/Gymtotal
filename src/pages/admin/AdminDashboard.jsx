import { useApp } from '../../context/AppContext';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { users, assistance, purchases } = useApp();
  const habilitados = users.filter(u => u.habilitado).length;
  const pendientes = assistance.filter(a => a.estado === 'pendiente').length;
  const totalPagos = users.flatMap(u => u.historialPagos || []);
  const ingresos = totalPagos.reduce((s, p) => s + (p.monto || 0), 0);
  const nuevosEste = users.filter(u => u.fechaAlta?.startsWith('2026-05')).length;

  const recentAssist = [...assistance].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 4);
  const recentPayments = totalPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);

  return (
    <div className="admin-dashboard anim-fade-in">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Resumen general del gimnasio</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(33,150,243,0.1)', color: 'var(--primary-light)' }}>👥</div>
          <div>
            <div className="stat-value text-gradient">{users.length}</div>
            <div className="stat-label">Total socios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--success)' }}>✅</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{habilitados}</div>
            <div className="stat-label">Habilitados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255,179,0,0.1)', color: 'var(--warning)' }}>🆘</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>{pendientes}</div>
            <div className="stat-label">Asistencias pend.</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,188,212,0.1)', color: 'var(--accent)' }}>💰</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>${(ingresos / 1000).toFixed(0)}K</div>
            <div className="stat-label">Ingresos totales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(224,64,251,0.1)', color: '#E040FB' }}>🆕</div>
          <div>
            <div className="stat-value" style={{ color: '#E040FB' }}>{nuevosEste}</div>
            <div className="stat-label">Altas este mes</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🆘 Últimas solicitudes de asistencia</h3>
          {recentAssist.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Sin solicitudes.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentAssist.map(a => (
                <div key={a.id} className="dash-item">
                  <div>
                    <p style={{ fontWeight: 600 }}>{a.usuarioNombre}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.tipo} · {new Date(a.fecha).toLocaleDateString('es-AR')}</p>
                  </div>
                  <span className={`badge ${a.estado === 'pendiente' ? 'badge-warning' : a.estado === 'atendido' ? 'badge-success' : 'badge-info'}`}>
                    {a.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>💳 Últimos pagos</h3>
          {recentPayments.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>Sin pagos.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentPayments.map((p, i) => {
                const user = users.find(u => u.historialPagos?.some(hp => hp.id === p.id));
                return (
                  <div key={i} className="dash-item">
                    <div>
                      <p style={{ fontWeight: 600 }}>{user?.nombre || 'Desconocido'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.concepto}</p>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--success)' }}>${p.monto?.toLocaleString('es-AR')}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📊 Distribución por plan</h3>
        <div className="plan-bars">
          {['mensual', 'trimestral', 'anual'].map(p => {
            const count = users.filter(u => u.plan === p).length;
            const pct = users.length ? Math.round((count / users.length) * 100) : 0;
            const colors = { mensual: 'var(--primary-light)', trimestral: 'var(--accent)', anual: 'var(--primary-dark)' };
            return (
              <div key={p} className="plan-bar-row">
                <span style={{ textTransform: 'capitalize', width: 100, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p}</span>
                <div className="plan-bar-track">
                  <div className="plan-bar-fill" style={{ width: `${pct}%`, background: colors[p] }} />
                </div>
                <span style={{ fontWeight: 700, width: 48, textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
