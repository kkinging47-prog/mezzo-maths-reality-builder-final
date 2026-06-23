import { useEffect, useState } from 'react';
import { Project } from '../data/projects';
import VisualBuilder from './VisualBuilder';

type MissionEngineProps = {
  project: Project;
};

type ViewMode = '2d' | '3d' | 'vr';

type RewardTotals = {
  coins: number;
  xp: number;
  stars: number;
};

type RewardPopup = {
  coins: number;
  xp: number;
  label: string;
} | null;

const FOOTBRIDGE_REWARD = {
  coinsPerStep: 20,
  xpPerStep: 50,
  completionStars: 3,
};

export default function MissionEngine({ project }: MissionEngineProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [rewardedStepIds, setRewardedStepIds] = useState<number[]>([]);
  const [rewardTotals, setRewardTotals] = useState<RewardTotals>({ coins: 0, xp: 0, stars: 0 });
  const [rewardPopup, setRewardPopup] = useState<RewardPopup>(null);
  const [feedback, setFeedback] = useState('');
  const [mode, setMode] = useState<ViewMode>('2d');
  const [showHint, setShowHint] = useState(false);

  const step = project.steps[stepIndex];
  const completed = completedStepIds.length;
  const missionComplete = completed === project.steps.length;
  const isFootbridgeMission = project.id === 'footbridge-stream';
  const isBridgeImmersiveMode = isFootbridgeMission && (mode === '3d' || mode === 'vr');
  const progressPercent = project.steps.length > 0 ? Math.round((completed / project.steps.length) * 100) : 0;

  useEffect(() => {
    setShowHint(false);
  }, [project.id, stepIndex]);

  useEffect(() => {
    setStepIndex(0);
    setAnswers({});
    setCompletedStepIds([]);
    setRewardedStepIds([]);
    setRewardTotals({ coins: 0, xp: 0, stars: 0 });
    setRewardPopup(null);
    setFeedback('');
    setMode('2d');
    setShowHint(false);
  }, [project.id]);

  useEffect(() => {
    if (!rewardPopup) return;
    const timer = window.setTimeout(() => setRewardPopup(null), 1400);
    return () => window.clearTimeout(timer);
  }, [rewardPopup]);

  function awardFootbridgeStep(stepId: number, completedCountAfterAnswer: number) {
    if (!isFootbridgeMission || rewardedStepIds.includes(stepId)) return;

    const isFinalStep = completedCountAfterAnswer === project.steps.length;

    setRewardedStepIds((current) => (current.includes(stepId) ? current : [...current, stepId]));
    setRewardTotals((current) => ({
      coins: current.coins + FOOTBRIDGE_REWARD.coinsPerStep,
      xp: current.xp + FOOTBRIDGE_REWARD.xpPerStep,
      stars: isFinalStep ? FOOTBRIDGE_REWARD.completionStars : current.stars,
    }));
    setRewardPopup({
      coins: FOOTBRIDGE_REWARD.coinsPerStep,
      xp: FOOTBRIDGE_REWARD.xpPerStep,
      label: isFinalStep ? 'Bridge certified!' : 'Build step reward',
    });
  }

  function checkAnswer() {
    const userAnswer = Number(answers[step.id]);
    if (Number.isNaN(userAnswer)) {
      setFeedback('Type a number first.');
      return;
    }
    if (userAnswer === step.answer) {
      const alreadyCompleted = completedStepIds.includes(step.id);
      const completedCountAfterAnswer = alreadyCompleted ? completedStepIds.length : completedStepIds.length + 1;

      setShowHint(false);
      setFeedback(`Correct. ${step.buildText}`);
      setCompletedStepIds((current) => (current.includes(step.id) ? current : [...current, step.id]));
      awardFootbridgeStep(step.id, completedCountAfterAnswer);

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
    setRewardedStepIds([]);
    setRewardTotals({ coins: 0, xp: 0, stars: 0 });
    setRewardPopup(null);
    setStepIndex(0);
    setFeedback('');
    setMode('2d');
    setShowHint(false);
  }

  function testBridgeCrossing() {
    setMode('3d');
    setFeedback('Bridge crossing test started. Watch the completed structure in the builder view.');
  }

  const questionContent = missionComplete ? (
    <>
      <span className="eyebrow">Mission complete</span>
      <h3>{isFootbridgeMission ? '🌉 Footbridge Certified' : '✅ Questions Set Complete'}</h3>
      <p>
        {isFootbridgeMission
          ? 'Excellent work. Your measurements, planks, support posts and safety load calculations have produced a safe community footbridge.'
          : `You have completed all questions for ${project.title}. The full build is now unlocked in the 3D and VR views.`}
      </p>
      {isFootbridgeMission ? (
        <div className="footbridge-complete-card">
          <div>
            <strong>{rewardTotals.coins}</strong>
            <span>Coins earned</span>
          </div>
          <div>
            <strong>{rewardTotals.stars}</strong>
            <span>Stars awarded</span>
          </div>
          <div>
            <strong>{rewardTotals.xp}</strong>
            <span>XP gained</span>
          </div>
        </div>
      ) : (
        <div className="formula-box complete-message">
          <strong>Next:</strong> Switch to 3D or VR mode and run the movement test to watch the completed build in action.
        </div>
      )}
      <div className="action-row mission-question-actions">
        {isFootbridgeMission ? (
          <button className="btn btn-primary" type="button" onClick={testBridgeCrossing}>Test Bridge Crossing</button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={() => setMode('3d')}>View 3D Test</button>
        )}
        {isFootbridgeMission && <button className="btn btn-primary" type="button" onClick={() => setMode('vr')}>Enter VR Test</button>}
        <button className="btn btn-ghost" type="button" onClick={resetMission}>Restart Mission</button>
      </div>
      {feedback && <div className="feedback success">{feedback}</div>}
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
        {isFootbridgeMission && (
          <div className="footbridge-reward-hud" aria-label="Footbridge mission rewards">
            <div><strong>{rewardTotals.coins}</strong><span>Coins</span></div>
            <div><strong>{rewardTotals.stars}</strong><span>Stars</span></div>
            <div><strong>{rewardTotals.xp}</strong><span>XP</span></div>
            <div className="mission-progress-meter"><strong>{progressPercent}%</strong><span>Progress</span><i><b style={{ width: `${progressPercent}%` }} /></i></div>
          </div>
        )}
        {rewardPopup && (
          <div className="reward-pop" role="status" aria-live="polite">
            <strong>{rewardPopup.label}</strong>
            <span>+{rewardPopup.coins} coins · +{rewardPopup.xp} XP</span>
          </div>
        )}
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
        .mission-layout-board .mission-builder-zone{grid-area:builder;min-height:520px;display:grid;grid-template-rows:auto auto 1fr;background:#111b2d;border:1px solid rgba(148,163,184,.3);border-radius:1.35rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.05);position:relative;overflow:hidden}
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
        .mission-layout-board .mission-question-actions{justify-content:center;display:flex;gap:.65rem;margin-top:.85rem;flex-wrap:wrap}
        .mission-layout-board .mission-question-panel .feedback{max-width:680px;margin:.8rem auto 0;text-align:center;border-radius:999px;padding:.65rem .9rem}
        .mission-layout-board .mission-question-panel .formula-box{max-width:760px;margin:.85rem auto;background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.18)}
        .mission-layout-board .mode-switcher{justify-content:center}.mission-layout-board .visual-builder{min-height:430px;height:100%;display:grid;align-content:stretch}
        .footbridge-reward-hud{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem;padding:.7rem .85rem;margin:.35rem .85rem .55rem;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,64,175,.72));border:1px solid rgba(191,219,254,.2);border-radius:1rem;color:#eff6ff;z-index:2}
        .footbridge-reward-hud div{display:grid;gap:.1rem;min-width:0}.footbridge-reward-hud strong{font-size:1.08rem;color:#fff}.footbridge-reward-hud span{font-size:.74rem;color:#bfdbfe;text-transform:uppercase;letter-spacing:.08em}.mission-progress-meter i{display:block;height:6px;border-radius:999px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:.25rem}.mission-progress-meter b{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#22c55e,#facc15);transition:width .45s ease}
        .reward-pop{position:absolute;top:88px;right:1.15rem;z-index:5;display:grid;gap:.15rem;padding:.75rem .95rem;border-radius:1rem;background:linear-gradient(135deg,#fff7ed,#fef3c7);color:#7c2d12;box-shadow:0 18px 45px rgba(15,23,42,.24);animation:rewardFloat 1.4s ease both}.reward-pop strong{font-size:.92rem}.reward-pop span{font-size:.82rem;font-weight:700}
        .footbridge-complete-card{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin:1rem auto .2rem;max-width:720px}.footbridge-complete-card div{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.18);border-radius:1rem;padding:1rem;text-align:center;color:white}.footbridge-complete-card strong{display:block;font-size:clamp(1.45rem,2.4vw,2rem);line-height:1}.footbridge-complete-card span{display:block;margin-top:.35rem;color:#dff7ff;font-size:.82rem;text-transform:uppercase;letter-spacing:.08em}
        @keyframes rewardFloat{0%{opacity:0;transform:translateY(12px) scale(.92)}18%{opacity:1;transform:translateY(0) scale(1)}76%{opacity:1;transform:translateY(-8px) scale(1)}100%{opacity:0;transform:translateY(-22px) scale(.98)}}
        .mission-grid.bridge-3d-stacked{grid-template-columns:1fr;grid-template-areas:'question' 'builder' 'side';max-width:1380px;margin:0 auto;gap:1rem}.mission-grid.bridge-3d-stacked .mission-side-stack{min-height:auto;grid-template-rows:auto}.mission-grid.bridge-3d-stacked .mission-builder-zone{min-height:auto}.mission-grid.bridge-3d-stacked .question-card.complete-frame{background:linear-gradient(135deg,rgba(220,252,231,.15),rgba(239,246,255,.15));border:1px solid rgba(16,185,129,.22)}
        @media (max-width:1040px){.mission-layout-board{grid-template-columns:1fr;grid-template-areas:'builder' 'side' 'question'}.mission-layout-board .mission-side-stack{min-height:auto;grid-template-rows:auto}.mission-layout-board .mission-builder-zone{min-height:480px}}
        @media (max-width:760px){.mission-layout-board .mission-question-actions{align-items:stretch;flex-direction:column}.mission-layout-board .mission-tools-panel,.mission-layout-board .mission-tasks-panel,.mission-layout-board .mission-question-panel{padding:.85rem}.mission-layout-board .mission-builder-zone{min-height:420px}.footbridge-reward-hud{grid-template-columns:repeat(2,minmax(0,1fr));margin:.35rem .7rem .55rem}.reward-pop{top:126px;right:.7rem;left:.7rem}.footbridge-complete-card{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
