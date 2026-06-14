import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton } from '../../../components/UI/BackButton';
import exercisesData from '../../../data/exercises.json';
import './DailyGoal.css';

const GOALS = [
  { id: 'fuerza',       label: 'Fuerza',        icon: '💪', desc: 'Desarrollar músculo y potencia', groups: ['pecho','espalda','piernas','hombros','brazos'] },
  { id: 'cardio',       label: 'Cardio',         icon: '🏃', desc: 'Quemar calorías y mejorar resistencia', groups: ['cardio'] },
  { id: 'flexibilidad', label: 'Flexibilidad',   icon: '🧘', desc: 'Elongación y movilidad articular', groups: ['core'] },
  { id: 'gluteos',      label: 'Glúteos',        icon: '🍑', desc: 'Enfoque en glúteos y piernas', groups: ['gluteos','piernas'] },
  { id: 'core',         label: 'Core / Abs',     icon: '⬛', desc: 'Fortalecer el centro del cuerpo', groups: ['core'] },
  { id: 'fullbody',     label: 'Full Body',      icon: '🔥', desc: 'Trabajo completo de todo el cuerpo', groups: ['pecho','espalda','piernas','core'] },
];

export default function DailyGoal() {
  const [goal, setGoal] = useState(null);
  const [exercises, setExercises] = useState([]);

  const handleSelect = (g) => {
    setGoal(g);
    const all = exercisesData.grupos
      .filter(gr => g.groups.includes(gr.id))
      .flatMap(gr => gr.ejercicios);
    // Pick up to 5 exercises
    const picked = all.slice(0, 5);
    setExercises(picked);
  };

  return (
    <KioskLayout>
      <div className="daily-page page-enter">
        <div className="daily-content">
          <BackButton />
          <div className="daily-header">
            <div style={{ fontSize: '3rem' }}>🎯</div>
            <h1>Objetivo Diario</h1>
            <p>Elegí el enfoque de tu sesión de hoy</p>
          </div>

          {!goal ? (
            <div className="goals-grid">
              {GOALS.map(g => (
                <button key={g.id} className="goal-card" onClick={() => handleSelect(g)} id={`btn-goal-${g.id}`}>
                  <div className="goal-icon">{g.icon}</div>
                  <div className="goal-label">{g.label}</div>
                  <div className="goal-desc">{g.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="daily-result anim-fade-in">
              <div className="daily-result-header">
                <span style={{ fontSize: '2.5rem' }}>{goal.icon}</span>
                <div>
                  <h2>Sesión de {goal.label}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>{goal.desc}</p>
                </div>
              </div>

              <div className="daily-exercises">
                {exercises.map((ex, i) => (
                  <div key={ex.id} className="daily-ex-card" style={{ animationDelay: `${i * 0.08}s` }}>
                    <div className="daily-ex-num">{i + 1}</div>
                    <div className="daily-ex-body">
                      <p className="daily-ex-name">{ex.nombre}</p>
                      <p className="daily-ex-detail">{ex.descripcion}</p>
                      <div className="daily-ex-tags">
                        <span className="badge badge-info">{ex.series} series</span>
                        <span className="badge badge-accent">{ex.reps} reps</span>
                        <span className="badge badge-warning">⏱ {ex.descanso}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-lg" onClick={() => { setGoal(null); setExercises([]); }}>
                  Cambiar objetivo
                </button>
                <button className="btn btn-primary btn-lg" onClick={() => { setGoal(null); setExercises([]); }}>
                  ¡Vamos! 💪
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </KioskLayout>
  );
}
