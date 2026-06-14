import { useState } from 'react';
import { KioskLayout } from '../components/Layout/KioskLayout';
import { NumericKeypad } from '../components/UI/NumericKeypad';
import { BackButton } from '../components/UI/BackButton';
import { useApp } from '../context/AppContext';
import exercisesData from '../data/exercises.json';
import './Routine.css';

const STEPS = { DNI: 'dni', VIEW: 'view', BUILD: 'build', SAVED: 'saved' };

export default function Routine() {
  const { findUserByDni, saveRoutine } = useApp();
  const [step, setStep] = useState(STEPS.DNI);
  const [dni, setDni] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [selected, setSelected] = useState([]);
  const [mode, setMode] = useState('view'); // view | build

  const handleDni = () => {
    const found = findUserByDni(dni);
    if (!found) { setError('DNI no encontrado.'); return; }
    setUser(found);
    setSelected(found.rutina || []);
    setError('');
    setStep(STEPS.VIEW);
  };

  const toggleExercise = (nombre) => {
    setSelected(prev =>
      prev.includes(nombre) ? prev.filter(e => e !== nombre) : [...prev, nombre]
    );
  };

  const handleSave = () => {
    saveRoutine(user.id, selected);
    setStep(STEPS.SAVED);
  };

  const groups = exercisesData.grupos;

  return (
    <KioskLayout>
      <div className="routine-page page-enter">
        <div className="routine-content">
          <BackButton />

          <div className="routine-header">
            <div className="routine-icon">🏋️</div>
            <h1>Mi Rutina</h1>
            <p>Armá y gestioná tu rutina de entrenamiento</p>
          </div>

          {step === STEPS.DNI && (
            <div className="routine-step anim-fade-in">
              <NumericKeypad value={dni} onChange={setDni} onConfirm={handleDni} maxLength={8} placeholder="Tu DNI" />
              {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
              <button className="btn btn-primary btn-xl" style={{ width: 340 }} onClick={handleDni} disabled={dni.length < 7} id="btn-confirm-dni-routine">
                Ver mi rutina
              </button>
            </div>
          )}

          {step === STEPS.VIEW && user && (
            <div className="routine-view anim-fade-in">
              <div className="routine-user-bar">
                <span>🏋️ {user.nombre}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setMode(mode === 'view' ? 'build' : 'view')}>
                    {mode === 'view' ? '✏️ Editar rutina' : '👁 Ver mi rutina'}
                  </button>
                  {mode === 'build' && (
                    <button className="btn btn-primary btn-sm" onClick={handleSave} id="btn-save-routine">
                      💾 Guardar
                    </button>
                  )}
                </div>
              </div>

              {mode === 'view' ? (
                <div className="routine-display">
                  <h3 style={{ marginBottom: 16 }}>Tu rutina actual ({selected.length} ejercicios)</h3>
                  {selected.length === 0 ? (
                    <div className="routine-empty">
                      <p>No tenés una rutina armada todavía.</p>
                      <button className="btn btn-accent btn-lg" onClick={() => setMode('build')}>Armar rutina ahora</button>
                    </div>
                  ) : (
                    <div className="routine-exercise-list">
                      {selected.map((nombre, i) => {
                        const ex = groups.flatMap(g => g.ejercicios).find(e => e.nombre === nombre);
                        return (
                          <div key={i} className="routine-exercise-item">
                            <span className="routine-ex-num">{i + 1}</span>
                            <div>
                              <p style={{ fontWeight: 600 }}>{nombre}</p>
                              {ex && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex.series} series · {ex.reps} reps · Descanso: {ex.descanso}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="routine-builder">
                  <div className="builder-groups">
                    {groups.map(g => (
                      <button
                        key={g.id}
                        className={`group-chip ${activeGroup === g.id ? 'group-active' : ''}`}
                        style={{ '--g-color': g.color }}
                        onClick={() => setActiveGroup(activeGroup === g.id ? null : g.id)}
                      >
                        {g.icono} {g.nombre}
                      </button>
                    ))}
                  </div>

                  {activeGroup && (
                    <div className="builder-exercises anim-fade-in">
                      <h4 style={{ marginBottom: 12 }}>
                        {groups.find(g => g.id === activeGroup)?.nombre} — elegí ejercicios
                      </h4>
                      <div className="exercises-grid">
                        {groups.find(g => g.id === activeGroup)?.ejercicios.map(ex => (
                          <button
                            key={ex.id}
                            className={`exercise-card ${selected.includes(ex.nombre) ? 'exercise-selected' : ''}`}
                            onClick={() => toggleExercise(ex.nombre)}
                          >
                            <div className="exercise-check">{selected.includes(ex.nombre) ? '✓' : '+'}</div>
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
                    <span>{selected.length} ejercicios seleccionados</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === STEPS.SAVED && (
            <div className="routine-saved anim-fade-in-scale">
              <div style={{ fontSize: '4rem' }}>💾</div>
              <h2>¡Rutina guardada!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Tu rutina de {selected.length} ejercicios fue actualizada.</p>
              <button className="btn btn-primary btn-lg" onClick={() => { setStep(STEPS.VIEW); setMode('view'); }}>
                Ver mi rutina
              </button>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
