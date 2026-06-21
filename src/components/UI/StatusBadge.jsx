export function StatusBadge({ status }) {
  const map = {
    true:        { label: 'Habilitado', cls: 'badge-success', dot: '#00E676' },
    false:       { label: 'Inhabilitado', cls: 'badge-danger', dot: '#F44336' },
    pendiente:   { label: 'Pendiente', cls: 'badge-warning', dot: '#FFB300' },
    en_curso:    { label: 'En curso', cls: 'badge-info', dot: '#2196F3' },
    atendido:    { label: 'Atendido', cls: 'badge-success', dot: '#00E676' },
    activo:      { label: 'Activo', cls: 'badge-accent', dot: '#00BCD4' },
    vencido:     { label: 'Vencido', cls: 'badge-danger', dot: '#F44336' },
    mensual:     { label: 'Mensual', cls: 'badge-info', dot: '#2196F3' },
    trimestral:  { label: 'Trimestral', cls: 'badge-accent', dot: '#00BCD4' },
    anual:       { label: 'Anual', cls: 'badge-info', dot: '#1565C0' },
  };

  const key = String(status);
  const cfg = map[key] || { label: key, cls: 'badge-info', dot: '#888' };

  return (
    <span className={`badge ${cfg.cls}`}>
      {/* <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} /> */}
      {cfg.label}
    </span>
  );
}
