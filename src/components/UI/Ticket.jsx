import './Ticket.css';

export function Ticket({ type = 'payment', data, onClose, onPrint }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    if (onPrint) { onPrint(); return; }
    window.print();
  };

  return (
    <div className="ticket-wrapper">
      <div className="ticket" id="printable-ticket">
        <div className="ticket-header">
          <div className="ticket-logo">
            <span className="ticket-logo-gt">GT</span>
            <span className="ticket-logo-text">GYMTOTAL</span>
          </div>
          <p className="ticket-subtitle">Comprobante Oficial</p>
        </div>

        <div className="ticket-divider-dashed" />

        <div className="ticket-meta">
          <div className="ticket-meta-row">
            <span>Fecha</span><span>{dateStr}</span>
          </div>
          <div className="ticket-meta-row">
            <span>Hora</span><span>{timeStr}</span>
          </div>
          {data.id && (
            <div className="ticket-meta-row">
              <span>N° Comprobante</span><span className="ticket-id">#{data.id}</span>
            </div>
          )}
        </div>

        <div className="ticket-divider-dashed" />

        <div className="ticket-body">
          {type === 'payment' && (
            <>
              <div className="ticket-field">
                <span className="ticket-field-label">Socio</span>
                <span className="ticket-field-value">{data.nombre}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">DNI</span>
                <span className="ticket-field-value">{data.dni}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">Concepto</span>
                <span className="ticket-field-value">{data.concepto}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">Método de pago</span>
                <span className="ticket-field-value">Terminal</span>
              </div>
              <div className="ticket-divider-dashed" />
              <div className="ticket-total">
                <span>TOTAL</span>
                <span className="ticket-total-amount">${data.monto?.toLocaleString('es-AR')}</span>
              </div>
            </>
          )}

          {type === 'purchase' && (
            <>
              {data.usuarioNombre && (
                <div className="ticket-field">
                  <span className="ticket-field-label">Socio</span>
                  <span className="ticket-field-value">{data.usuarioNombre}</span>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                {data.items?.map((item, i) => (
                  <div key={i} className="ticket-item-row">
                    <span>{item.nombre} x{item.cantidad}</span>
                    <span>${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                  </div>
                ))}
              </div>
              <div className="ticket-divider-dashed" />
              <div className="ticket-total">
                <span>TOTAL</span>
                <span className="ticket-total-amount">${data.total?.toLocaleString('es-AR')}</span>
              </div>
            </>
          )}

          {type === 'membership' && (
            <>
              <div className="ticket-field">
                <span className="ticket-field-label">Nuevo Socio</span>
                <span className="ticket-field-value">{data.nombre}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">DNI</span>
                <span className="ticket-field-value">{data.dni}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">N° de Socio</span>
                <span className="ticket-field-value ticket-id">{data.id}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">Plan</span>
                <span className="ticket-field-value">{data.plan}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">Válido hasta</span>
                <span className="ticket-field-value">{data.fechaVencimiento}</span>
              </div>
            </>
          )}

          {type === 'routine' && (
            <>
              <div className="ticket-field">
                <span className="ticket-field-label">Objetivo</span>
                <span className="ticket-field-value">{data.goalIcon} {data.goalLabel}</span>
              </div>
              <div className="ticket-field">
                <span className="ticket-field-label">Descripción</span>
                <span className="ticket-field-value">{data.goalDesc}</span>
              </div>
              <div className="ticket-divider-dashed" />
              <div style={{ marginTop: 6 }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, color: '#999' }}>
                  Ejercicios de la sesión
                </p>
                {data.exercises?.map((ex, i) => (
                  <div key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: i < data.exercises.length - 1 ? '1px dashed #eee' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{i + 1}. {ex.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3, fontSize: '0.75rem', color: '#666' }}>
                      <span>📊 {ex.series} series</span>
                      <span>🔁 {ex.reps} reps</span>
                      <span>⏱ {ex.descanso}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ticket-divider-dashed" />
        <div className="ticket-footer">
          <p>¡Gracias por entrenar con nosotros!</p>
          <p>gymtotal.com.ar — @gymtotal</p>
        </div>

        <div className="ticket-barcode">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="ticket-bar" style={{ width: Math.random() > 0.5 ? 3 : 2 }} />
          ))}
        </div>
      </div>

      <div className="ticket-actions">
        <button className="btn btn-primary btn-lg" onClick={handlePrint}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
          </svg>
          Imprimir ticket
        </button>
        <button className="btn btn-ghost btn-lg" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
