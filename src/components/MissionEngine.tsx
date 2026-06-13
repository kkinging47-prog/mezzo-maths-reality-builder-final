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
  const progress = Math.round((completed / project.steps.length) * 100);
  const isBridge3DMode = project.id === 'footbridge-stream' && mode === '3d';

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

  return (
    <div className={`mission-grid ${isBridge3DMode ? 'bridge-3d-stacked' : ''}`}>
      <section className="mission-panel card">
        <div className="mission-header-row">
          <div>
            <span className="eyebrow">Mission engine</span>
            <h2>{project.title}</h2>
          </div>
          <div className="score-pill">{progress}% complete</div>
        </div>

        <div className="progress-track" aria-label="Mission progress">
          <span style={{ width: `${progress}%` }} />
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
              {item.id}
            </button>
          ))}
        </div>

        <article className="question-card">
          <span className="eyebrow">Step {step.id}</span>
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
          <div className="action-row">
            <button className="btn btn-primary" type="button" onClick={checkAnswer}>Check & Build</button>
            <button className="btn btn-ghost" type="button" onClick={() => setShowHint((current) => !current)}>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>
          {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'success' : 'warning'}`}>{feedback}</div>}
        </article>

        {completed === project.steps.length && (
          <div className="certificate-box">
            <strong>✅ Questions Set Complete</strong>
            <p>You have completed all questions for {project.title}. Certificate preview unlocked.</p>
            <button className="btn btn-light" type="button" onClick={resetMission}>Restart Mission</button>
          </div>
        )}
      </section>

      <section className="builder-panel card">
        <div className="mode-switcher" aria-label="View mode switcher">
          {(['2d', '3d', 'vr'] as ViewMode[]).map((item) => (
            <button key={item} type="button" className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <VisualBuilder project={project} completed={completed} mode={mode} feedback={feedback} />
        <div className="tools-box">
          <strong>Mission tools</strong>
          <div>
            {project.tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </div>
      </section>

      <style>{`
        .mission-grid.bridge-3d-stacked{grid-template-columns:1fr;max-width:1500px;margin:0 auto;align-items:stretch}
        .mission-grid.bridge-3d-stacked .mission-panel{order:1}
        .mission-grid.bridge-3d-stacked .builder-panel{order:2;width:100%}
        .mission-grid.bridge-3d-stacked .question-card{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);column-gap:1rem;align-items:end}
        .mission-grid.bridge-3d-stacked .question-card>.eyebrow,.mission-grid.bridge-3d-stacked .question-card>h3,.mission-grid.bridge-3d-stacked .question-card>p,.mission-grid.bridge-3d-stacked .question-card>.formula-box,.mission-grid.bridge-3d-stacked .question-card>.feedback{grid-column:1/-1}
        .mission-grid.bridge-3d-stacked .question-card .answer-row{margin-top:0}
        .mission-grid.bridge-3d-stacked .question-card .action-row{margin-top:0;justify-content:flex-end}
        @media (max-width:840px){.mission-grid.bridge-3d-stacked .question-card{grid-template-columns:1fr}.mission-grid.bridge-3d-stacked .question-card .action-row{justify-content:flex-start;margin-top:1rem}}
      `}</style>
    </div>
  );
}
