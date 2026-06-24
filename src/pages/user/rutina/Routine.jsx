import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton, HomeButton } from '../../../components/UI/BackButton';
import { NumericKeypad } from '../../../components/UI/NumericKeypad';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import { useApp } from '../../../context/AppContext';
import exercisesData from '../../../data/exercises.json';
import './Routine.css';

const PASOS = { DNI: 'dni', VER: 'view', ARMAR: 'build', GUARDADO: 'saved' };

export default function Routine() {
  const { buscarPorDni, guardarRutina, usuarioActual, setUsuarioActual } = useApp();
  const [paso, setPaso] = useState(usuarioActual ? PASOS.VER : PASOS.DNI);
  const [dni, setDni] = useState(usuarioActual?.dni || '');
  const [usuario, setUsuario] = useState(usuarioActual || null);
  const [error, setError] = useState('');
  const [grupoActivo, setGrupoActivo] = useState(null);
  const [seleccionados, setSeleccionados] = useState(usuarioActual?.rutina || []);
  const [modo, setModo] = useState('view');
  const [mostrarTicket, setMostrarTicket] = useState(false);

  const confirmarDni = () => {
    const encontrado = buscarPorDni(dni);
    if (!encontrado) { setError('DNI no encontrado.'); return; }
    setUsuario(encontrado);
    setSeleccionados(encontrado.rutina || []);
    setError('');
    setPaso(PASOS.VER);
  };

  const toggleEjercicio = (nombre) => {
    setSeleccionados(prev =>
      prev.includes(nombre) ? prev.filter(e => e !== nombre) : [...prev, nombre]
    );
  };

  const eliminarEjercicio = (nombre) => {
    const actualizado = seleccionados.filter(e => e !== nombre);
    setSeleccionados(actualizado);
    guardarRutina(usuario.id, actualizado);
    setUsuario(prev => prev ? { ...prev, rutina: actualizado } : null);
    if (usuarioActual && usuarioActual.id === usuario.id) {
      setUsuarioActual(prev => prev ? { ...prev, rutina: actualizado } : null);
    }
  };

  const guardar = () => {
    guardarRutina(usuario.id, seleccionados);
    setUsuario(prev => prev ? { ...prev, rutina: seleccionados } : null);
    if (usuarioActual && usuarioActual.id === usuario.id) {
      setUsuarioActual(prev => prev ? { ...prev, rutina: seleccionados } : null);
    }
    setPaso(PASOS.GUARDADO);
  };

  const grupos = exercisesData.grupos;

  return (
    <KioskLayout>
      <div className="routine-page page-enter">
        <div className="routine-content">
          <BackButton />
          <div className="routine-header">
            <h1>Mi Rutina</h1>
            <p>Armá y gestioná tu rutina de entrenamiento</p>
          </div>

          {paso === PASOS.DNI && (
            <div className="routine-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={confirmarDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              <button className="btn btn-primary btn-xl" style={{ width: 340 }} onClick={confirmarDni} disabled={dni.length < 7} id="btn-confirm-dni-routine">
                Ver mi rutina
              </button>
            </div>
          )}

          {paso === PASOS.VER && usuario && (
            <div className="routine-view anim-fade-in">
              <div className="routine-user-bar">
                <span> {usuario.nombre}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {modo === 'view' && seleccionados.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setMostrarTicket(true)} id="btn-print-personal-routine">
                      Imprimir rutina
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => setModo(modo === 'view' ? 'build' : 'view')}>
                    {modo === 'view' ? '✏️ Editar rutina' : 'Ver mi rutina'}
                  </button>
                  {modo === 'build' && (
                    <button className="btn btn-primary btn-sm" onClick={guardar} id="btn-save-routine">Guardar</button>
                  )}
                </div>
              </div>

              {modo === 'view' ? (
                <div className="routine-display">
                  <h3 style={{ marginBottom: 16 }}>Tu rutina actual ({seleccionados.length} ejercicios)</h3>
                  {seleccionados.length === 0 ? (
                    <div className="routine-empty">
                      <p>No tenés una rutina armada todavía.</p>
                      <button className="btn btn-accent btn-lg" onClick={() => setModo('build')}>Armar rutina ahora</button>
                    </div>
                  ) : (
                    <div className="routine-exercise-list">
                      {seleccionados.map((nombre, i) => {
                        const ex = grupos.flatMap(g => g.ejercicios).find(e => e.nombre === nombre);
                        return (
                          <div key={i} className="routine-exercise-item">
                            <span className="daily-ex-num">{i + 1}</span>
                            <div style={{ flex: 1 }}>
                              <div className="daily-ex-tags-rutina">
                                <p className="daily-ex-name">{ex.nombre}</p>
                                <p className="daily-ex-detail">{ex.descripcion}</p>
                                <div className='excercise-detail'>
                                  <span className="badge badge-info badge-info-diario">{ex.series} series</span>
                                  <span className="badge badge-accent badge-accent-diario">{ex.reps}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--danger)', fontSize: '1.1rem', padding: '4px 8px', minWidth: 'unset' }}
                              onClick={() => eliminarEjercicio(nombre)}
                              id={`btn-del-ex-${i}`}
                              title="Eliminar ejercicio"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="routine-builder">
                  <div className="builder-groups">
                    {grupos.map(g => (
                      <button
                        key={g.id}
                        className={`group-chip ${grupoActivo === g.id ? 'group-active' : ''}`}
                        style={{ '--g-color': g.color }}
                        onClick={() => setGrupoActivo(grupoActivo === g.id ? null : g.id)}
                      >
                        {g.nombre}
                      </button>
                    ))}
                  </div>

                  {grupoActivo && (
                    <div className="builder-exercises anim-fade-in">
                      <h4 style={{ marginBottom: 12 }}>
                        {grupos.find(g => g.id === grupoActivo)?.nombre} — elegí ejercicios
                      </h4>
                      <div className="exercises-grid">
                        {grupos.find(g => g.id === grupoActivo)?.ejercicios.map(ex => (
                          <button
                            key={ex.id}
                            className={`exercise-card ${seleccionados.includes(ex.nombre) ? 'exercise-selected' : ''}`}
                            onClick={() => toggleEjercicio(ex.nombre)}
                          >
                            <div className="exercise-check">{seleccionados.includes(ex.nombre) ? '✓' : '+'}</div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ex.nombre}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.series}×{ex.reps} · {ex.descanso}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="builder-summary">
                    <span>{seleccionados.length} ejercicios seleccionados</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {paso === PASOS.GUARDADO && (
            <div className="routine-saved anim-fade-in-scale">
              <h2>¡Rutina guardada!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Tu rutina de {seleccionados.length} ejercicios fue actualizada.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={() => { setPaso(PASOS.VER); setModo('view'); }}>
                  Ver mi rutina
                </button>
                <HomeButton />
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={mostrarTicket} onClose={() => setMostrarTicket(false)} title="Mi Rutina" maxWidth={420}>
        <Ticket type="routine" data={{
          goalLabel: 'Mi Rutina',
          goalDesc: 'Entrenamiento personalizado',
          goalSubtitle: 'Rutina personal',
          exercises: seleccionados.map(nombre => exercisesData.grupos.flatMap(g => g.ejercicios).find(e => e.nombre === nombre)).filter(Boolean)
        }} onClose={() => setMostrarTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}
