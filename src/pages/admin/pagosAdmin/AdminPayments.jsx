import { useApp } from '../../../context/AppContext';

export default function AdminPayments() {
  const { users } = useApp();
  const allPayments = users.flatMap(u =>
    (u.historialPagos || []).map(p => ({ ...p, userName: u.nombre, userDni: u.dni, userId: u.id }))
  ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const total = allPayments.reduce((s, p) => s + (p.monto || 0), 0);

  return (
    <div className="anim-fade-in" style={{ maxWidth: 1000 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Historial de Pagos</h1>
        <p style={{ color: 'var(--text-muted)' }}>{allPayments.length} transacciones · Total: <strong style={{ color: 'var(--success)' }}>${total.toLocaleString('es-AR')}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          ['Total recaudado', `$${total.toLocaleString('es-AR')}`, 'var(--success)'],
          ['Transacciones', allPayments.length, 'var(--primary-light)'],
          ['Promedio', `$${allPayments.length ? Math.round(total / allPayments.length).toLocaleString('es-AR') : 0}`, 'var(--accent)'],
        ].map(([l, v, c]) => (
          <div key={l} className="stat-card">
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: c }}>{v}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Socio</th>
              <th>Concepto</th>
              <th>Fecha</th>
              <th>Método</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {allPayments.map(p => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{p.id}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.userName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI {p.userDni}</div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 220 }}>{p.concepto}</td>
                <td style={{ fontSize: '0.88rem' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                <td><span className="badge badge-info">{p.metodo}</span></td>
                <td style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                  ${p.monto?.toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allPayments.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Sin pagos registrados.</p>}
      </div>
    </div>
  );
}
