import { useState } from 'react';
import { KioskLayout } from '../../../components/Layout/KioskLayout';
import { BackButton, HomeButton } from '../../../components/UI/BackButton';
import { Modal } from '../../../components/UI/Modal';
import { Ticket } from '../../../components/UI/Ticket';
import exercisesData from '../../../data/exercises.json';
import GOALS from '../../../data/goals.json';
import './DailyGoal.css';

export default function DailyGoal() {
  const [goal, setGoal] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [showTicket, setShowTicket] = useState(false);

  const handleSelect = (g) => {
    setGoal(g);
    const all = exercisesData.grupos
      .filter(gr => g.groups.includes(gr.id))
      .flatMap(gr => gr.ejercicios);
    // Pick up to 5 exercises
    const picked = all.slice(0, 5);
    setExercises(picked);
  };

  const routineTicketData = goal ? {
    goalIcon: goal.icon,
    goalLabel: goal.label,
    goalDesc: goal.desc,
    exercises,
  } : {};

  return (
    <KioskLayout>
      <div className="daily-page page-enter">
        <div className="daily-content">
          <BackButton />
          <div className="daily-header">
            {/* <div style={{ fontSize: '3rem' }}>🎯</div> */}
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
                        <span className="badge badge-info badge-info-diario">{ex.series} series</span>
                        <span className="badge badge-accent badge-accent-diario">{ex.reps}</span>
                        {/* <span className="badge badge-warning">⏱ {ex.descanso}</span> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost btn-lg btn-grande" onClick={() => { setGoal(null); setExercises([]); }}>
                  Cambiar objetivo
                </button>
                <button className="btn btn-accent btn-lg btn-grande" onClick={() => setShowTicket(true)} id="btn-print-routine">
                  Imprimir rutina
                </button>
            
                <HomeButton className="btn-grande"/>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showTicket} onClose={() => setShowTicket(false)} title="Tu sesión de hoy" maxWidth={420}>
        <Ticket type="routine" data={routineTicketData} onClose={() => setShowTicket(false)} />
      </Modal>
    </KioskLayout>
  );
}

