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
  const [builderExpanded, setBuilderExpanded] = useState(false);

  const step = project.steps[stepIndex];
  const completed = completedStepIds.length;
  const missionComplete = completed === project.steps.length;
  const isFootbridgeMission = project.id === 'footbridge-stream';
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
    setBuilderExpanded(false);
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
    if (!step) return;

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
      setFeedback('Try again. Use the hint if you need help.');
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
    setBuilderExpanded(false);
  }

  function testBridgeCrossing() {
    setMode('3d');
    setBuilderExpanded(true);
    setFeedback('Bridge crossing test started. Watch the completed structure in the builder view.');
  }

  const questionContent = missionComplete ? (
    <>
      <span className="eyebrow">Complete</span>
      <h3>{isFootbridgeMission ? '🌉 Bridge Certified' : '✅ Mission Complete'}</h3>
      <p>
        {isFootbridgeMission
          ? 'Your measurements, planks, posts and load checks have built a safe footbridge.'
          : `You have completed ${project.title}.`}
      </p>
      {isFootbridgeMission ? (
        <div className="footbridge-complete-card">
          <div><strong>{rewardTotals.coins}</strong><span>Coins</span></div>
          <div><strong>{rewardTotals.stars}</strong><span>Stars</span></div>
          <div><strong>{rewardTotals.xp}</strong><span>XP</span></div>
        </div>
      ) : (
        <div className="formula-box complete-message"><strong>Next:</strong> Switch to 3D or VR mode and run the test.</div>
      )}
      <div className="action-row mission-question-actions">
        {isFootbridgeMission ? (
          <button className="btn btn-primary" type="button" onClick={testBridgeCrossing}>Test Crossing</button>
        ) : (
          <button className="btn btn-primary" type="button" onClick={() => setMode('3d')}>View 3D Test</button>
        )}
        {isFootbridgeMission && <button className="btn btn-primary" type="button" onClick={() => setMode('vr')}>VR Test</button>}
        <button className="btn btn-ghost" type="button" onClick={resetMission}>Restart</button>
      </div>
      {feedback && <div className="feedback success">{feedback}</div>}
    </>
  ) : step ? (
    <>
      <span className="eyebrow">Step {step.id}/{project.steps.length}</span>
      <h3>{step.title}</h3>
      <p>{step.question}</p>
      {showHint && (
        <div className="formula-box">
          <strong>Hint:</strong> {step.formula || step.hint}
          {step.hint && step.formula !== step.hint && <span> — {step.hint}</span>}
        </div>
      )}
      <label className="answer-row">
        <span>Answer</span>
        <input
          type="number"
          inputMode="decimal"
          value={answers[step.id] ?? ''}
          onChange={(event) => setAnswers((current) => ({ ...current, [step.id]: event.target.value }))}
          placeholder={step.unit}
        />
        <em>{step.unit}</em>
      </label>
      <div className="action-row mission-question-actions">
        <button className="btn btn-primary" type="button" onClick={checkAnswer}>Check</button>
        <button className="btn btn-ghost" type="button" onClick={() => setShowHint((current) => !current)}>
          {showHint ? 'Hide Hint' : 'Hint'}
        </button>
      </div>
      {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'success' : 'warning'}`}>{feedback}</div>}
    </>
  ) : null;

  return (
    <div className={`mission-grid figma-mission-grid mission-layout-board ${builderExpanded ? 'builder-expanded' : ''}`}>
      <section className="builder-panel card mission-builder-zone" aria-label="2D, 3D and VR builder area">
        <div className="builder-controls">
          <div className="mode-switcher" aria-label="View mode switcher">
            {(['2d', '3d', 'vr'] as ViewMode[]).map((item) => (
              <button key={item} type="button" className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="expand-view-button" type="button" onClick={() => setBuilderExpanded((current) => !current)}>
            {builderExpanded ? 'Fit Page' : 'Expand View'}
          </button>
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

      <section className="mission-question-panel card" aria-label="Mission question area">
        <article className={`question-card ${missionComplete ? 'complete-frame' : ''}`}>
          {questionContent}
        </article>
      </section>

      <aside className="mission-side-stack" aria-label="Mission tools and task list">
        <section className="tools-box mission-tools-panel card">
          <strong>Tools</strong>
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
            <h2>Build Steps</h2>
            <div className="mission-chip-row" aria-label="Math concepts">
              {project.maths.slice(0, 2).map((item) => <span key={item}>{item}</span>)}
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

      <style>{`
        .mission-layout-board{display:grid;grid-template-columns:minmax(280px,.72fr) minmax(430px,1.35fr) minmax(220px,.55fr);grid-template-areas:'question builder side';gap:.7rem;max-width:1460px;margin:0 auto;align-items:stretch;height:clamp(560px,calc(100vh - 145px),780px);min-height:0;overflow:hidden}
        .mission-layout-board.builder-expanded{grid-template-columns:minmax(250px,.5fr) minmax(620px,1.65fr);grid-template-areas:'question builder' 'side builder';height:clamp(660px,calc(100vh - 118px),900px)}
        .mission-layout-board .mission-builder-zone{grid-area:builder;min-height:0;height:100%;display:grid;grid-template-rows:auto auto minmax(0,1fr);background:#111b2d;border:1px solid rgba(148,163,184,.3);border-radius:1.1rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.05);position:relative;overflow:hidden;padding:.65rem}
        .mission-layout-board .mission-question-panel{grid-area:question;min-height:0;height:100%;display:grid;align-items:stretch;background:#1b4fbd;border:1px solid rgba(148,163,184,.3);border-radius:1.1rem;padding:.8rem;overflow:auto}
        .mission-layout-board .mission-question-panel .question-card{margin:0;background:transparent;border:0;box-shadow:none;min-height:0;display:grid;align-content:start;width:100%;gap:.55rem;color:white}
        .mission-layout-board .mission-question-panel .question-card h3{font-size:clamp(1.15rem,1.55vw,1.55rem);line-height:1.1;color:white;margin:.1rem 0;text-align:left}
        .mission-layout-board .mission-question-panel .question-card p{color:#eaf2ff;text-align:left;font-size:clamp(.92rem,1vw,1rem);line-height:1.35;margin:0}
        .mission-layout-board .mission-question-panel .eyebrow{text-align:left;color:#dff7ff;font-size:.78rem;margin:0}
        .mission-layout-board .mission-side-stack{grid-area:side;display:grid;grid-template-rows:auto minmax(0,1fr);gap:.7rem;min-height:0;height:100%;overflow:hidden}
        .mission-layout-board .mission-tools-panel,.mission-layout-board .mission-tasks-panel{border-radius:1.1rem;background:#1b4fbd;border:1px solid rgba(148,163,184,.3);padding:.8rem;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);color:white;min-height:0}
        .mission-layout-board .mission-tools-panel{display:grid;align-content:start;gap:.55rem}
        .mission-layout-board .mission-tools-panel strong,.mission-layout-board .mission-tasks-heading h2{font-size:1.05rem;color:#fff;margin:0}
        .mission-layout-board .mission-tools-panel div{display:flex;gap:.35rem;flex-wrap:wrap;margin:0}
        .mission-layout-board .mission-tools-panel span{min-width:unset;background:rgba(255,255,255,.15);color:#eff6ff;border:1px solid rgba(255,255,255,.18);font-size:.72rem;padding:.35rem .5rem;border-radius:999px}
        .mission-layout-board .mission-tools-panel .tool-unlocked{background:rgba(34,197,94,.24);color:#dcfce7;border-color:rgba(187,247,208,.28)}
        .mission-layout-board .mission-tasks-panel{display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden}
        .mission-layout-board .mission-tasks-heading{display:grid;gap:.45rem;margin-bottom:.5rem}
        .mission-layout-board .mission-chip-row{display:flex;gap:.35rem;flex-wrap:wrap}.mission-layout-board .mission-chip-row span{background:rgba(255,255,255,.14);color:#dff7ff;font-size:.68rem;padding:.28rem .45rem;border-radius:999px}
        .mission-layout-board .step-list{display:grid;gap:.35rem;overflow:auto;padding-right:.15rem}.mission-layout-board .step-dot{padding:.48rem .55rem;border-radius:.8rem;gap:.4rem;text-align:left}.mission-layout-board .task-label{font-size:.78rem;line-height:1.1}
        .builder-controls{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin-bottom:.45rem;z-index:2}.mission-layout-board .mode-switcher{justify-content:flex-start;gap:.3rem;margin:0}.mission-layout-board .mode-switcher button{padding:.45rem .62rem;font-size:.78rem}.expand-view-button{border:0;border-radius:999px;background:#e0f2fe;color:#0f172a;font-weight:900;font-size:.75rem;padding:.48rem .7rem;cursor:pointer;white-space:nowrap}
        .mission-layout-board .visual-builder{min-height:0;height:100%;display:grid;align-content:stretch}.mission-layout-board .visual-caption{display:none}.mission-layout-board .visual-stage{min-height:0}
        .mission-layout-board .answer-row{margin:.45rem 0 0;width:100%;grid-template-columns:1fr;gap:.35rem}.mission-layout-board .answer-row span{color:#f8fafc;font-size:.8rem;font-weight:900}.mission-layout-board .answer-row input{text-align:center;background:white;color:#0f172a;border-color:rgba(255,255,255,.65);border-radius:999px;height:2.55rem;font-size:1.1rem;font-weight:900}.mission-layout-board .answer-row em{display:none}
        .mission-layout-board .mission-question-actions{justify-content:flex-start;display:flex;gap:.45rem;margin-top:.35rem;flex-wrap:wrap}.mission-layout-board .mission-question-actions .btn{padding:.62rem .9rem;font-size:.86rem}
        .mission-layout-board .mission-question-panel .feedback{margin:.25rem 0 0;text-align:left;border-radius:.85rem;padding:.55rem .7rem;font-size:.84rem;line-height:1.25}.mission-layout-board .mission-question-panel .formula-box{margin:.15rem 0;background:rgba(255,255,255,.16);color:#fff;border:1px solid rgba(255,255,255,.18);font-size:.82rem;line-height:1.25;padding:.55rem .65rem;border-radius:.85rem}
        .footbridge-reward-hud{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem;padding:.48rem .55rem;margin:0 0 .45rem;background:linear-gradient(135deg,rgba(15,23,42,.9),rgba(30,64,175,.72));border:1px solid rgba(191,219,254,.2);border-radius:.85rem;color:#eff6ff;z-index:2}.footbridge-reward-hud div{display:grid;gap:.05rem;min-width:0}.footbridge-reward-hud strong{font-size:.98rem;color:#fff}.footbridge-reward-hud span{font-size:.64rem;color:#bfdbfe;text-transform:uppercase;letter-spacing:.06em}.mission-progress-meter i{display:block;height:5px;border-radius:999px;background:rgba(255,255,255,.18);overflow:hidden;margin-top:.2rem}.mission-progress-meter b{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#22c55e,#facc15);transition:width .45s ease}
        .reward-pop{position:absolute;top:5rem;right:.85rem;z-index:5;display:grid;gap:.1rem;padding:.55rem .75rem;border-radius:.8rem;background:linear-gradient(135deg,#fff7ed,#fef3c7);color:#7c2d12;box-shadow:0 18px 45px rgba(15,23,42,.24);animation:rewardFloat 1.4s ease both}.reward-pop strong{font-size:.85rem}.reward-pop span{font-size:.76rem;font-weight:800}
        .footbridge-complete-card{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;margin:.3rem 0}.footbridge-complete-card div{background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.18);border-radius:.85rem;padding:.55rem;text-align:center;color:white}.footbridge-complete-card strong{display:block;font-size:1.25rem;line-height:1}.footbridge-complete-card span{display:block;margin-top:.18rem;color:#dff7ff;font-size:.66rem;text-transform:uppercase;letter-spacing:.06em}
        @keyframes rewardFloat{0%{opacity:0;transform:translateY(12px) scale(.92)}18%{opacity:1;transform:translateY(0) scale(1)}76%{opacity:1;transform:translateY(-8px) scale(1)}100%{opacity:0;transform:translateY(-22px) scale(.98)}}
        @media (max-width:1180px){.mission-layout-board{grid-template-columns:minmax(260px,.75fr) minmax(420px,1.25fr);grid-template-areas:'question builder' 'side builder';height:auto;min-height:620px;overflow:visible}.mission-layout-board .mission-side-stack{grid-template-columns:1fr 1fr;grid-template-rows:auto;height:auto}.mission-layout-board.builder-expanded{grid-template-columns:1fr;grid-template-areas:'builder' 'question' 'side';height:auto}}
        @media (max-width:820px){.mission-layout-board{grid-template-columns:1fr;grid-template-areas:'question' 'builder' 'side';height:auto;overflow:visible}.mission-layout-board .mission-builder-zone{min-height:520px}.mission-layout-board .mission-side-stack{grid-template-columns:1fr}.footbridge-reward-hud{grid-template-columns:repeat(2,minmax(0,1fr))}.mission-layout-board .mission-question-actions{align-items:stretch;flex-direction:column}.reward-pop{top:7rem;right:.7rem;left:.7rem}.footbridge-complete-card{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
