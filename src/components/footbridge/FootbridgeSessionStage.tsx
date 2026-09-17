import { ReactNode, useMemo, useRef } from 'react';
import { decisionsForMission } from '../../footbridge/decisionCatalog';
import { DECISION_STORIES, MISSION_INTROS, MISSION_OUTROS } from '../../footbridge/sessionStories';
import { MissionId } from '../../footbridge/types';
import { FootbridgeController } from '../../footbridge/useFootbridgeProject';

interface Props {
  c: FootbridgeController;
  missionId: MissionId;
  missionTitle: string;
  scene: string;
  children: ReactNode;
}

export default function FootbridgeSessionStage({ c, missionId, missionTitle, scene, children }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const decisions = useMemo(() => decisionsForMission(missionId), [missionId]);
  const lastPage = decisions.length + 1;
  const storedPage = c.state.missionSessions?.[missionId] ?? 0;
  const redesignStart = c.state.redesignTargetMission === missionId && storedPage >= lastPage ? 1 : storedPage;
  const page = Math.max(0, Math.min(lastPage, redesignStart));
  const mode = page === 0 ? 'intro' : page === lastPage ? 'finish' : 'action';
  const actionIndex = mode === 'action' ? page : 0;
  const decision = mode === 'action' ? decisions[actionIndex - 1] : undefined;
  const story = mode === 'intro'
    ? MISSION_INTROS[missionId]
    : mode === 'finish'
      ? MISSION_OUTROS[missionId]
      : DECISION_STORIES[decision!.id];
  const canMoveForward = mode === 'intro' ? true : mode === 'finish' ? c.missionComplete(missionId) : canContinueAction(c, decision!.id);

  function setPage(nextPage: number) {
    const clamped = Math.max(0, Math.min(lastPage, nextPage));
    c.setState((current) => ({
      ...current,
      missionSessions: { ...(current.missionSessions ?? {}), [missionId]: clamped },
      updatedAt: new Date().toISOString(),
    }));
    requestAnimationFrame(() => hostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function next() {
    if (!canMoveForward) return;
    if (mode === 'finish') {
      if (missionId < 7) c.unlockNextMission();
      return;
    }
    setPage(page + 1);
  }

  return <section
    ref={hostRef}
    className="mission-session-stage"
    data-mission={missionId}
    data-mode={mode}
    data-action-index={actionIndex || undefined}
  >
    <div className="session-topline">
      <span>MISSION {missionId} · {missionTitle}</span>
      <strong>Session {page + 1} of {lastPage + 1}</strong>
    </div>

    <div className="session-progress-dots" aria-label={`Session ${page + 1} of ${lastPage + 1}`}>
      {Array.from({ length: lastPage + 1 }, (_, index) => <i key={index} className={index < page ? 'done' : index === page ? 'current' : ''} />)}
    </div>

    <div className="session-scene-grid">
      <div className="session-visual">
        <img src={scene} alt={`${missionTitle} adventure scene`} />
        <div className="session-scene-badge">{mode === 'intro' ? '🗺️ NEW MISSION' : mode === 'finish' ? '⭐ MISSION CHECKPOINT' : `🎯 PROJECT ACTION ${actionIndex}`}</div>
      </div>
      <div className="session-story-card">
        <span>{mode === 'action' ? 'YOUR NEXT CHALLENGE' : mode === 'finish' ? 'LOOK WHAT YOU ACHIEVED' : 'STORY TIME'}</span>
        <h2>{story.title}</h2>
        <p>{story.story}</p>
        <blockquote>{story.guide}</blockquote>
        <div className="session-info-pair">
          <div><b>💡 Why this matters</b><p>{story.whyItMatters}</p></div>
          <div><b>🧠 Maths focus</b><p>{story.focus}</p></div>
        </div>
      </div>
    </div>

    <div className="mission-render-host">{children}</div>

    {mode === 'action' && !canMoveForward && <div className="session-locked-message"><span>🔐</span><div><strong>Complete this project action to continue.</strong><p>Your answer, choice or test result is saved here before the next part of the adventure opens.</p></div></div>}

    <div className="session-nav">
      <button type="button" className="session-back" disabled={page === 0} onClick={() => setPage(page - 1)}>← Back</button>
      <div><span>{mode === 'action' ? `Action ${actionIndex} of ${decisions.length} in this mission` : mode === 'finish' ? 'Mission checkpoint' : 'Mission introduction'}</span><small>Your place is saved automatically.</small></div>
      <button type="button" className="session-next" disabled={!canMoveForward || (mode === 'finish' && missionId === 7)} onClick={next}>
        {mode === 'intro' ? 'Start Mission →' : mode === 'finish' ? (missionId < 7 ? 'Next Mission →' : 'Adventure Complete ⭐') : 'Next →'}
      </button>
    </div>
  </section>;
}

function canContinueAction(c: FootbridgeController, decisionId: number) {
  if (decisionId === 27) return c.state.normalTestStatus === 'STABLE' || c.state.normalTestStatus === 'SLIGHT MOVEMENT';
  if (decisionId === 28) return c.state.peakTestStatus === 'STABLE';
  if (decisionId === 29) return c.state.environmentTestStatus === 'STABLE';
  return Boolean(c.recordFor(decisionId)?.completed);
}
