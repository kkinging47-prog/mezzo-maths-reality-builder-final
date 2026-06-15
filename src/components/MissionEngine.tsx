import { useEffect, useState } from 'react';
import { Project } from '../data/projects';
import VisualBuilder from './VisualBuilder';

type MissionEngineProps = {
  project: Project;
};

type ViewMode = '2d' | '3d' | 'vr';

export default function MissionEngine({ project }: MissionEngineProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('');
  const [mode, setMode] = useState<ViewMode>('2d');
  const [showHint, setShowHint] = useState(false);

  const step = project.steps[stepIndex];
  const completed = completedStepIds.length;
  const missionComplete = completed === project.steps.length;
  const isBridgeImmersiveMode = project.id === 'footbridge-stream' && (mode === '3d' || mode === 'vr');

  useEffect(() => {
    setShowHint(false);
  }, [project.id, stepIndex]);

  function checkAnswer() {
    const userAnswer = Number(answers[step.id]);
    if (Number.isNaN(userAnswer)) {
      setFeedback('Type a number first.');
      return;
    }
    if (userAnswer === step.answer) {
      setShowHint(false);
      setFeedback(`Correct. ${step.buildText}`);
      setCompletedStepIds((current) => (current.includes(step.id) ? current : [...current, step.id]));
      if (stepIndex < project.steps.length - 1) {
        window.setTimeout(() => {
          setStepIndex((current) => current + 1);
          setFeedback('');
        }, 900);
      }
    } else {
      setFeedback('Not quite. Try again, or click Show Hint if you need help.');
    }
  }

  function resetMission() {
    setAnswers({});
    setCompletedStepIds([]);
    setStepIndex(0);
    setFeedback('');
    setMode('2d');
    setShowHint(false);
  }

  const questionContent = missionComplete ? (
    <>
      <span className="eyebrow">Questions set complete</span>
      <h3>✅ Questions Set Complete</h3>
      <p>You have completed all questions for {project.title}. The full build is now unlocked in the 3D and VR views.</p>
      <div className="formula-box complete-message">
        <strong>Next:</strong> Switch to 3D or VR mode and run the movement test to watch the completed build in action.
      </div>
      <div className="action-row mission-question-actions">
        <button className="btn btn-primary" type="button" onClick={() => setMode('3d')}>View 3D Test</button>
        {project.id === 'footbridge-stream' && <button className="btn btn-primary" type="button" onClick={() => setMode('vr')}>Enter VR Test</button>}
        <button className="btn btn-ghost" type="button" onClick={resetMission}>Restart Mission</button>
      </div>
    </>
  ) : (
    <>
      <span className="eyebrow">Step {step.id} of {project.steps.length}</span>
      <h3>{step.title}</h3>
      <p>{step.question}</p>
      {showHint && (
        <div className="formula-box">
          <strong>Formula guide:</strong> {step.formula || step.hint}
          {step.hint && step.formula !== step.hint && <span> — {step.hint}</span>}
        </div>
      )}
      <label className="answer-row">
        <span>Your answer</span>
        <input
          type="number"
          inputMode="decimal"
          value={answers[step.id] ?? ''}
          onChange={(event) => setAnswers((current) => ({ ...current, [step.id]: event.target.value }))}
          placeholder={`Answer in ${step.unit}`}
        />
        <em>{step.unit}</em>
      </label>
      <div className="action-row mission-question-actions">
        <button className="btn btn-primary" type="button" onClick={checkAnswer}>Check Answer</button>
        <button className="btn btn-ghost" type="button" onClick={() => setShowHint((current) => !current)}>
          {showHint ? 'Hide Hint' : 'Hint'}
        </button>
      </div>
      {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'success' : 'warning'}`}>{feedback}</div>}
    </>
  );

  return (
    <div className={`mission-grid figma-mission-grid mission-layout-board ${isBridgeImmersiveMode ? 'bridge-3d-stacked' : ''}`}>
      <section className="builder-panel card mission-builder-zone" aria-label="2D, 3D and VR builder area">
        <div className="mode-switcher" aria-label="View mode switcher">
          {(['2d', '3d', 'vr'] as ViewMode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>
              {item.toUpperCase()} View
            </button>
          ))}
        </div>
        <VisualBuilder project={project} completed={completed} mode={mode} feedback={feedback} />
      </section>

      <aside className="mission-side-stack" aria-label="Mission tools and task list">
        <section className="tools-box mission-tools-panel card">
          <strong>Unlocked Tools</strong>
          <div>
            {project.tools.map((tool, index) => (
              <span key={tool} className={index < completed ? 'tool-unlocked' : 'tool-locked'}>
                {index < completed ? '✓ ' : '🔒 '}{tool}
              </span>
            ))}
          </div>
        </section>

        <section className="mission-panel card mission-tasks-panel">
          <div className="mission-tasks-heading">
            <h2>Mission Task</h2>
            <div className="mission-chip-row" aria-label="Math concepts">
              {project.maths.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="step-list" aria-label="Mission steps">
            {project.steps.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`step-dot ${index === stepIndex ? 'current' : ''} ${completedStepIds.includes(item.id) ? 'done' : ''}`}
                onClick={() => {
                  setStepIndex(index);
                  setFeedback('');
                  setShowHint(false);
                }}
              >
                <span className="task-bullet" aria-hidden="true" />
                <span className="task-label">{item.title}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <section className="mission-question-panel card" aria-label="Mission question area">
        <article className={`question-card ${missionComplete ? 'complete-frame' : ''}`}>
          {questionContent}
        </article>
      </section>

      <style>{`
        .mission-layout-board{grid-template-columns:minmax(0,2.08fr) minmax(290px,.95fr);grid-template-areas:'builder side' 'question question';gap:1.15rem;max-width:1380px;margin:0 auto;align-items:stretch}
        .mission-layout-board .mission-builder-zone{grid-area:builder;min-height:520px;display:grid;grid-template-rows:auto 1fr;background:#111b2d;border:1px solid rgba(148,163,184,.3);border-radius:1.35rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
        .mission-layout-board .mission-side-stack{grid-area:side;display:grid;grid-template-rows:minmax(120px,.48fr) minmax(190px,.7fr);gap:1.15rem;min-height:520px}
        .mission-layout-board .mission-tools-panel,.mission-layout-board .mission-tasks-panel,.mission-layout-board .mission-question-panel{border-radius:1.35rem;background:#101827;border:1px solid rgba(148,163,184,.3);padding:1rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
        .mission-layout-board .mission-tools-panel{margin-top:0;display:grid;align-content:start;min-height:128px;background:#1b4fbd;color:white}
        .mission-layout-board .mission-tools-panel strong{font-size:clamp(1.25rem,2vw,1.85rem);color:#fff;margin-bottom:.75rem}
        .mission-layout-board .mission-tools-panel div{display:flex;gap:.45rem;flex-wrap:wrap;margin-top:0}
        .mission-layout-board .mission-tools-panel span{min-width:unset;background:rgba(255,255,255,.16);color:#eff6ff;border:1px solid rgba(255,255,255,.18)}
        .mission-layout-board .mission-tools-panel .tool-unlocked{background:rgba(34,197,94,.24);color:#dcfce7;border-color:rgba(187,247,208,.28)}
        .mission-layout-board .mission-tasks-panel{background:#1b4fbd;overflow:auto}
        .mission-layout-board .mission-tasks-heading h2{font-size:clamp(1.5rem,2.6vw,2.35rem);color:#fff;margin-bottom:.6rem}
        .mission-layout-board .mission-chip-row span{background:rgba(255,255,255,.14);color:#dff7ff}
        .mission-layout-board .mission-question-panel{grid-area:question;background:#1b4fbd;min-height:150px;display:grid;align-items:stretch}
        .mission-layout-board .mission-question-panel .question-card{margin:0;background:transparent;border:0;box-shadow:none;min-height:126px;display:grid;align-content:center;max-width:1040px;margin-inline:auto;width:100%}
        .mission-layout-board .mission-question-panel .question-card h3{font-size:clamp(1.3rem,2.1vw,1.85rem);color:white;text-align:center}
        .mission-layout-board .mission-question-panel .question-card p{color:#eaf2ff;text-align:center;font-size:1.05rem}
        .mission-layout-board .mission-question-panel .eyebrow{text-align:center;color:#dff7ff}
        .mission-layout-board .mission-question-panel .answer-row{max-width:520px;margin:.7rem auto 0;width:100%;grid-template-columns:1fr;gap:.45rem}
        .mission-layout-board .mission-question-panel .answer-row span{text-align:center;color:#f8fafc}.mission-layout-board .mission-question-panel .answer-row input{text-align:center;background:white;color:#0f172a;border-color:rgba(255,255,255,.65);border-radius:999px}.mission-layout-board .mission-question-panel .answer-row em{display:none}
        .mission-layout-board .mission-question-actions{justify-content:center;display:flex;gap:.65rem;margin-top:.85rem}
        .mission-layout-board .mission-question-panel .feedback{max-width:680px;margin:.8rem auto 0;text-align:center;border-radius:999px;padding:.65rem .9rem}
        .mission-layout-board .mission-question-panel .formula-box{max-width:760px;margin:.85rem auto;background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.18)}
        .mission-layout-board .mode-switcher{justify-content:center}.mission-layout-board .visual-builder{min-height:430px;height:100%;display:grid;align-content:stretch}
        .mission-grid.bridge-3d-stacked{grid-template-columns:1fr;grid-template-areas:'question' 'builder' 'side';max-width:1380px;margin:0 auto;gap:1rem}.mission-grid.bridge-3d-stacked .mission-side-stack{min-height:auto;grid-template-rows:auto}.mission-grid.bridge-3d-stacked .mission-builder-zone{min-height:auto}.mission-grid.bridge-3d-stacked .question-card.complete-frame{background:linear-gradient(135deg,rgba(220,252,231,.15),rgba(239,246,255,.15));border:1px solid rgba(16,185,129,.22)}
        @media (max-width:1040px){.mission-layout-board{grid-template-columns:1fr;grid-template-areas:'builder' 'side' 'question'}.mission-layout-board .mission-side-stack{min-height:auto;grid-template-rows:auto}.mission-layout-board .mission-builder-zone{min-height:480px}}
        @media (max-width:760px){.mission-layout-board .mission-question-actions{align-items:stretch;flex-direction:column}.mission-layout-board .mission-tools-panel,.mission-layout-board .mission-tasks-panel,.mission-layout-board .mission-question-panel{padding:.85rem}.mission-layout-board .mission-builder-zone{min-height:420px}}
      `}</style>
    </div>
  );
}
