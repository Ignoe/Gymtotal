import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/UI/StatusBadge';

const etiquetaTipo = {
  tecnica: 'Corrección técnica',
  nueva_rutina: 'Nueva rutina',
  lesion: 'Lesión/Molestia',
  general: 'Consulta general',
  administrativo: 'Ayuda Administrativa'
};

export default function AdminAssistance() {
  const { asistencias, actualizarAsistencia } = useApp();
  const [filtro, setFiltro] = useState('todos');

  const filtradas = asistencias.filter(a => filtro === 'todos' || a.estado === filtro);
  const ordenadas = [...filtradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="anim-fade-in" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Solicitudes de Asistencia</h1>
          <p style={{ color: 'var(--text-muted)' }}>{asistencias.filter(a => a.estado === 'pendiente').length} pendientes</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['todos', 'Todas'], ['pendiente', 'Pendientes'], ['atendido', 'Atendidas']].map(([v, l]) => (
          <button style={{ cursor: 'pointer' }} key={v} className={`cat-chip ${filtro === v ? 'cat-active' : ''}`} onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ordenadas.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className='div-asistencia-info' style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: a.usuarioNombre === 'Visitante sin registro' ? 'var(--accent)' : 'inherit'
                }}>
                  {a.usuarioNombre}
                </span>
                <StatusBadge status={a.estado} />
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                <strong>{etiquetaTipo[a.tipo]}</strong> · {new Date(a.fecha).toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{a.descripcion}</p>
              {a.atendidoPor && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: 6 }}>✓ Atendido por: {a.atendidoPor}</p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              {a.estado === 'pendiente' && (
                <button className="btn btn-success btn-sm" onClick={() => actualizarAsistencia(a.id, { estado: 'atendido', atendidoPor: 'Prof. en turno' })} id={`btn-assist-done-${a.id}`}>
                  Marcar atendido
                </button>
              )}
            </div>
          </div>
        ))}
        {ordenadas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>No hay solicitudes {filtro !== 'todos' ? filtro : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
