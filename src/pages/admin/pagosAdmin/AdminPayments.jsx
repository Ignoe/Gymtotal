import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../../components/UI/Modal';

export default function AdminPayments() {
  const { users, purchases } = useApp();
  const [showDetail, setShowDetail] = useState(null);

  const userPayments = users.flatMap(u =>
    (u.historialPagos || []).map(p => ({ ...p, userName: u.nombre, userDni: u.dni, userId: u.id, type: 'payment' }))
  );

  const purchasePayments = (purchases || []).map(p => {
    const u = users.find(user => user.id === p.usuarioId);
    return {
      ...p,
      id: p.id,
      fecha: p.fecha,
      userName: u ? u.nombre : 'Consumidor Final',
      userDni: u ? u.dni : '-',
      userId: p.usuarioId,
      concepto: 'Compra de productos',
      monto: p.total,
      metodo: 'terminal',
      type: 'purchase',
      items: p.items,
    };
  });

  const allPayments = [...userPayments, ...purchasePayments].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const total = allPayments.reduce((s, p) => s + (p.monto || 0), 0);

  return (
    <>
      <div className="anim-fade-in" style={{ maxWidth: 1000 }}>
        <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Historial de Pagos</h1>
        <p style={{ color: 'var(--text-muted)' }}>{allPayments.length} transacciones · Total: <strong style={{ color: 'var(--success)' }}>${total.toLocaleString('es-AR')}</strong></p>
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
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{p.id.slice(0, 8)}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{p.userName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI {p.userDni}</div>
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 220 }}>
                  {p.type === 'purchase' ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setShowDetail(p)}>Ver detalle</button>
                    </div>
                  ) : (
                    p.concepto
                  )}
                </td>
                <td style={{ fontSize: '0.88rem' }}>{new Date(p.fecha).toLocaleDateString('es-AR')}</td>
                <td><span className="badge badge-info">{p.metodo}</span></td>
                <td style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1rem' }}>
                  ${p.monto?.toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allPayments.length === 0 && <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Sin pagos ni compras registradas.</p>}
      </div>
    </div>

    {/* Detail Modal */}
    <Modal isOpen={!!showDetail} onClose={() => {}} title="Detalle de la compra" maxWidth={540}>
      {showDetail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Comprador:</span>
            <span>{showDetail.userName || 'Consumidor Final'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Fecha:</span>
            <span>{showDetail.fecha ? new Date(showDetail.fecha).toLocaleDateString('es-AR') : ''}</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 8 }}>Artículos</p>
            {(showDetail.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                <span>{item.cantidad || 1}x {item.nombre || 'Artículo'}</span>
                <span style={{ fontWeight: 600 }}>${((item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontSize: '1.1rem' }}>
            <span style={{ fontWeight: 800 }}>Total</span>
            <span style={{ fontWeight: 800, color: 'var(--success)' }}>${(showDetail.monto || 0).toLocaleString('es-AR')}</span>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setShowDetail(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </Modal>
  </>
  );
}
