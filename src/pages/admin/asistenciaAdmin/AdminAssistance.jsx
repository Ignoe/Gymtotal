import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../../components/UI/StatusBadge';

export default function AdminAssistance() {
  const { assistance, updateAssistance } = useApp();
  const [filter, setFilter] = useState('todos');

  const filtered = assistance.filter(a => filter === 'todos' || a.estado === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const typeLabel = { tecnica: 'Corrección técnica', nueva_rutina: 'Nueva rutina', lesion: 'Lesión/Molestia', general: 'Consulta general', administrativo: 'Ayuda Administrativa' };
  const typeIcon  = { tecnica: '🎯', nueva_rutina: '📋', lesion: '🩹', general: '💬', administrativo: '💼' };

  return (
    <div className="anim-fade-in" style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>Solicitudes de Asistencia</h1>
          <p style={{ color: 'var(--text-muted)' }}>{assistance.filter(a => a.estado === 'pendiente').length} pendientes</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['todos','Todas'],['pendiente','Pendientes'],['en_curso','En curso'],['atendido','Atendidas']].map(([v,l]) => (
          <button key={v} className={`cat-chip ${filter === v ? 'cat-active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map(a => (
          <div key={a.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>{typeIcon[a.tipo] || '❓'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{a.usuarioNombre}</span>
                <StatusBadge status={a.estado} />
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                <strong>{typeLabel[a.tipo]}</strong> · {new Date(a.fecha).toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{a.descripcion}</p>
              {a.atendidoPor && (
                <p style={{ fontSize: '0.78rem', color: 'var(--accent)', marginTop: 6 }}>✓ Atendido por: {a.atendidoPor}</p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              {a.estado === 'pendiente' && (
                <button className="btn btn-accent btn-sm" onClick={() => updateAssistance(a.id, { estado: 'en_curso', atendidoPor: 'Prof. en turno' })} id={`btn-assist-start-${a.id}`}>
                  Tomar
                </button>
              )}
              {a.estado === 'en_curso' && (
                <button className="btn btn-success btn-sm" onClick={() => updateAssistance(a.id, { estado: 'atendido' })} id={`btn-assist-done-${a.id}`}>
                  Marcar atendido
                </button>
              )}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
            <p>No hay solicitudes {filter !== 'todos' ? filter : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
