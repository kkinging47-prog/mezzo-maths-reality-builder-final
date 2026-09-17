import { useEffect, useMemo, useState } from 'react';
import { MISSION_NAMES, decisionsForMission } from '../footbridge/decisionCatalog';
import { distanceSavedMetres, generateFootbridgeScenario, journeyReductionPercent } from '../footbridge/scenarioEngine';
import { clearFootbridgeState, createInitialFootbridgeState, loadFootbridgeState, nextMission, saveFootbridgeState } from '../footbridge/state';
import { DecisionRecord, FootbridgeProjectState, MissionId, MisconceptionTag } from '../footbridge/types';
import './footbridge-project-engine.css';

const SAFETY_NOTICE = 'Educational simulation only. Structural values in this project are fictional learning data and must not be used for real bridge construction. Real bridges require qualified civil/structural engineers and site-specific engineering assessment.';

function makeSeed() {
  const random = Math.floor(Math.random() * 0xffffffff);
  return ((Date.now() & 0xffffffff) ^ random) >>> 0;
}

function recordFor(state: FootbridgeProjectState, id: number): DecisionRecord {
  return state.decisionRecords[id];
}

function toleranceFor(level: number) {
  if (level === 1) return 0.2;
  if (level === 3) return 0.05;
  return 0.1;
}

function bestSiteId(state: FootbridgeProjectState) {
  const ranked = [...state.scenario.sites].sort((a, b) => {
    const scoreA = a.accessRating + a.environmentalRating + a.convenienceRating - a.spanMetres * 0.08 - a.costFactor;
    const scoreB = b.accessRating + b.environmentalRating + b.convenienceRating - b.spanMetres * 0.08 - b.costFactor;
    return scoreB - scoreA;
  });
  return ranked[0].id;
}

export default function FootbridgeProjectEngine() {
  const [state, setState] = useState<FootbridgeProjectState>(() => {
    const saved = loadFootbridgeState();
    return saved ?? createInitialFootbridgeState(generateFootbridgeScenario(makeSeed(), 2));
  });
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [working, setWorking] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [designReason, setDesignReason] = useState('');

  useEffect(() => {
    saveFootbridgeState(state);
  }, [state]);

  const completedCount = useMemo(() => Object.values(state.decisionRecords).filter((record) => record.completed).length, [state.decisionRecords]);
  const progressPercent = Math.round((completedCount / 30) * 100);
  const scenario = state.scenario;
  const selectedSite = scenario.sites.find((site) => site.id === state.selectedSiteId);

  function setDecisionFeedback(id: number, message: string) {
    setFeedback((current) => ({ ...current, [id]: message }));
  }

  function addNotebook(section: string, entry: string) {
    setState((current) => ({
      ...current,
      notebook: {
        ...current.notebook,
        [section]: [...(current.notebook[section] ?? []), entry],
      },
    }));
  }

  function recordAttempt(id: number, answer: string | number | boolean | null, correct: boolean, misconceptionTag?: MisconceptionTag, notebookSection?: string, notebookEntry?: string) {
    setState((current) => {
      const previous = current.decisionRecords[id];
      const now = new Date().toISOString();
      const attempt = {
        attemptNumber: previous.attempts.length + 1,
        answer,
        working: working[id] || undefined,
        correct,
        createdAt: now,
        hintLevelAtAttempt: previous.highestHintLevel,
        misconceptionTag,
      };
      const completed = previous.completed || correct;
      const updatedRecord: DecisionRecord = {
        ...previous,
        completed,
        firstStartedAt: previous.firstStartedAt ?? now,
        completedAt: correct ? previous.completedAt ?? now : previous.completedAt,
        attempts: [...previous.attempts, attempt],
        originalAnswer: previous.originalAnswer ?? answer,
        revisedAnswer: previous.attempts.length > 0 ? answer : previous.revisedAnswer,
      };
      const nextNotebook = notebookSection && notebookEntry && correct && !previous.completed
        ? { ...current.notebook, [notebookSection]: [...(current.notebook[notebookSection] ?? []), notebookEntry] }
        : current.notebook;
      const nextTags = misconceptionTag && !correct && !current.misconceptionTags.includes(misconceptionTag)
        ? [...current.misconceptionTags, misconceptionTag]
        : current.misconceptionTags;
      return {
        ...current,
        decisionRecords: { ...current.decisionRecords, [id]: updatedRecord },
        notebook: nextNotebook,
        misconceptionTags: nextTags,
        updatedAt: now,
      };
    });
  }

  function useHint(id: number) {
    setState((current) => {
      const previous = current.decisionRecords[id];
      const level = Math.min(4, previous.highestHintLevel + 1);
      return {
        ...current,
        decisionRecords: {
          ...current.decisionRecords,
          [id]: { ...previous, hintsUsed: previous.hintsUsed + 1, highestHintLevel: level },
        },
      };
    });
  }

  function hintText(id: number) {
    const level = recordFor(state, id).highestHintLevel;
    if (!level) return '';
    const hints: Record<number, string[]> = {
      3: [
        'Guiding question: are both journey distances currently in the same unit?',
        `Relevant data: the old journey is ${scenario.originalJourneyKm} km and the new journey is ${scenario.newJourneyMetres} m.`,
        'Relationship: convert kilometres to metres, then subtract new distance from old distance.',
        `Worked support: ${scenario.originalJourneyKm} km = ${scenario.originalJourneyKm * 1000} m. Subtract the new journey from that value.`,
      ],
      4: [
        'Guiding question: what fraction of the original journey has been removed?',
        'Use the distance saved from your previous calculation and compare it with the original journey.',
        'Relationship: percentage reduction = distance saved ÷ original distance × 100.',
        `Use metres consistently. Original distance = ${scenario.originalJourneyKm * 1000} m.`,
      ],
      6: [
        'Measure from one bank marker to the opposite bank marker.',
        'Use the virtual survey reading, not the journey distance.',
        'Your measurement should be close to the actual site span; a tolerance is allowed.',
        'Recheck both endpoints and record the span to one decimal place.',
      ],
      9: [
        'A scale drawing converts the real simulation span into centimetres on the planning board.',
        `The project scale is 1 cm : ${scenario.scaleMetresPerCm} m.`,
        'Relationship: drawing length = measured span ÷ metres represented by 1 cm.',
        'Use the selected site span and divide by the scale value.',
      ],
    };
    return hints[id]?.[Math.max(0, level - 1)] ?? 'Review the information already collected in your project notebook.';
  }

  function unlockNextMission() {
    setState((current) => {
      const next = nextMission(current.currentMission);
      return {
        ...current,
        currentMission: next,
        highestUnlockedMission: Math.max(current.highestUnlockedMission, next) as MissionId,
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startNewScenario() {
    if (!window.confirm('Start a new community project? Your current local Footbridge project will be replaced.')) return;
    clearFootbridgeState();
    const fresh = createInitialFootbridgeState(generateFootbridgeScenario(makeSeed(), scenario.difficultyLevel));
    setState(fresh);
    setResponses({});
    setWorking({});
    setFeedback({});
    setDesignReason('');
  }

  function missionComplete(missionId: MissionId) {
    return decisionsForMission(missionId).every((decision) => state.decisionRecords[decision.id]?.completed);
  }

  function taskClass(id: number) {
    return recordFor(state, id).completed ? 'project-action complete' : 'project-action';
  }

  function numberInput(id: number, placeholder: string) {
    return (
      <input
        type="number"
        inputMode="decimal"
        value={responses[id] ?? ''}
        onChange={(event) => setResponses((current) => ({ ...current, [id]: event.target.value }))}
        placeholder={placeholder}
      />
    );
  }

  function workingBoard(id: number) {
    return (
      <textarea
        rows={2}
        value={working[id] ?? ''}
        onChange={(event) => setWorking((current) => ({ ...current, [id]: event.target.value }))}
        placeholder="Working board (optional)"
      />
    );
  }

  function renderMissionOne() {
    const expectedDistanceSaved = distanceSavedMetres(scenario);
    const expectedReduction = journeyReductionPercent(scenario);
    return (
      <div className="project-mission-content">
        <div className="mission-narrative">
          <span>Community briefing</span>
          <h2>Adom and Nkabom need your investigation.</h2>
          <p>Residents currently use a long route around the river. Visit the information points, understand who uses the route and decide what the project team needs to solve.</p>
        </div>
        <div className="community-data-grid">
          <article><strong>{scenario.dailyUsers}</strong><span>typical daily users</span></article>
          <article><strong>{scenario.schoolchildren}</strong><span>schoolchildren</span></article>
          <article><strong>{scenario.farmers}</strong><span>farmers</span></article>
          <article><strong>{scenario.traders}</strong><span>traders</span></article>
          <article><strong>{scenario.peakUsers}</strong><span>peak simultaneous users</span></article>
        </div>

        <article className={taskClass(1)}>
          <div><span>Community investigation</span><h3>What is the main problem the project team should solve?</h3></div>
          <div className="choice-grid">
            {[
              ['detour', 'The two communities are separated by the river, forcing a much longer journey.'],
              ['market', 'The communities need a larger market building.'],
              ['traffic', 'The main problem is vehicle parking congestion.'],
            ].map(([value, label]) => <button key={value} type="button" onClick={() => {
              const correct = value === 'detour';
              recordAttempt(1, value, correct, correct ? undefined : 'DATA_INTERPRETATION_ERROR', 'COMMUNITY_SURVEY', 'Main problem identified: the river separation causes a long detour between Adom and Nkabom.');
              setDecisionFeedback(1, correct ? 'Investigation recorded in the project notebook.' : 'That does not match the evidence collected from the two communities. Review the resident stories and route map.');
            }}>{label}</button>)}
          </div>
          {feedback[1] && <p className="action-feedback">{feedback[1]}</p>}
        </article>

        <article className={taskClass(2)}>
          <div><span>Community-use analysis</span><h3>How many people must the project team be ready to accommodate at the busiest moment?</h3></div>
          {numberInput(2, 'Peak simultaneous users')}
          <button className="btn btn-primary" type="button" onClick={() => {
            const answer = Number(responses[2]);
            const correct = answer === scenario.peakUsers;
            recordAttempt(2, answer, correct, correct ? undefined : 'DATA_INTERPRETATION_ERROR', 'COMMUNITY_SURVEY', `Peak simultaneous use recorded: ${scenario.peakUsers} people.`);
            setDecisionFeedback(2, correct ? 'Correct. The peak-use figure is now part of the project brief.' : 'Check the community-use information again. Daily users and peak simultaneous users are different measures.');
          }}>Record use information</button>
          {feedback[2] && <p className="action-feedback">{feedback[2]}</p>}
        </article>

        <article className={taskClass(3)}>
          <div><span>Journey analysis</span><h3>Calculate how much distance a typical journey would save.</h3></div>
          <div className="evidence-strip"><b>Existing journey:</b> {scenario.originalJourneyKm} km <b>After connection:</b> {scenario.newJourneyMetres} m</div>
          {workingBoard(3)}
          {numberInput(3, 'Distance saved in metres')}
          <div className="task-buttons"><button className="btn btn-primary" type="button" onClick={() => {
            const answer = Number(responses[3]);
            const correct = Math.abs(answer - expectedDistanceSaved) <= 1;
            recordAttempt(3, answer, correct, correct ? undefined : 'UNIT_CONVERSION_ERROR', 'CALCULATIONS', `Distance saved = ${expectedDistanceSaved} m.`);
            setDecisionFeedback(3, correct ? 'Distance saving confirmed and added to the project notebook.' : 'Recheck the units before subtracting the two distances.');
          }}>Submit calculation</button><button className="btn btn-ghost" type="button" onClick={() => useHint(3)}>Hint</button></div>
          {hintText(3) && <p className="hint-box">{hintText(3)}</p>}
          {feedback[3] && <p className="action-feedback">{feedback[3]}</p>}
        </article>

        <article className={taskClass(4)}>
          <div><span>Impact calculation</span><h3>Calculate the percentage reduction in journey distance.</h3></div>
          {workingBoard(4)}
          {numberInput(4, 'Percentage reduction')}
          <div className="task-buttons"><button className="btn btn-primary" type="button" onClick={() => {
            const answer = Number(responses[4]);
            const correct = Math.abs(answer - expectedReduction) <= 0.2;
            recordAttempt(4, answer, correct, correct ? undefined : 'PERCENTAGE_ERROR', 'CALCULATIONS', `Journey distance reduction = ${expectedReduction}%.`);
            setDecisionFeedback(4, correct ? 'Impact calculation accepted.' : 'Review the relationship between distance saved and the original journey.');
          }}>Submit impact calculation</button><button className="btn btn-ghost" type="button" onClick={() => useHint(4)}>Hint</button></div>
          {hintText(4) && <p className="hint-box">{hintText(4)}</p>}
          {feedback[4] && <p className="action-feedback">{feedback[4]}</p>}
        </article>

        {missionComplete(1) && <button className="mission-advance" type="button" onClick={unlockNextMission}>Your investigation is complete. Report to the river survey team →</button>}
      </div>
    );
  }

  function renderMissionTwo() {
    const tolerance = toleranceFor(scenario.difficultyLevel);
    const chosenActualSpan = selectedSite?.spanMetres;
    return (
      <div className="project-mission-content">
        <div className="mission-narrative"><span>Field survey</span><h2>Survey the river before any design work begins.</h2><p>Compare possible crossing locations, measure the selected crossing, inspect seasonal evidence and prepare a scale representation.</p></div>

        <article className={taskClass(5)}>
          <div><span>Site investigation</span><h3>Select the crossing location that gives the strongest overall balance of access, convenience, environmental conditions and project cost.</h3></div>
          <div className="site-grid">{scenario.sites.map((site) => <button key={site.id} type="button" className={state.selectedSiteId === site.id ? 'selected' : ''} onClick={() => {
            setState((current) => ({ ...current, selectedSiteId: site.id }));
            const correct = site.id === bestSiteId(state);
            recordAttempt(5, site.id, correct, correct ? undefined : 'LOGICAL_REASONING_ERROR', 'SITE_SURVEY', `Selected crossing location: ${site.name}.`);
            setDecisionFeedback(5, correct ? 'The committee accepts this location as the strongest overall balance for this scenario.' : 'The site has advantages, but the committee wants you to compare all four factors before confirming the location.');
          }}><strong>{site.name}</strong><span>{site.narrative}</span><small>Access {site.accessRating}/5 · Environment {site.environmentalRating}/5 · Convenience {site.convenienceRating}/5 · Cost factor {site.costFactor.toFixed(2)}</small></button>)}</div>
          {feedback[5] && <p className="action-feedback">{feedback[5]}</p>}
        </article>

        <article className={taskClass(6)}>
          <div><span>VR measurement</span><h3>Measure the selected river crossing and record your reading.</h3></div>
          {!selectedSite ? <p className="locked-note">Select an accepted crossing location first.</p> : <>
            <div className="survey-tool"><span>Bank marker A</span><i /><span>Bank marker B</span><small>The correct span is intentionally hidden. Use your survey reading.</small></div>
            {numberInput(6, 'Measured span in simulation metres')}
            <div className="task-buttons"><button className="btn btn-primary" type="button" onClick={() => {
              const answer = Number(responses[6]);
              const correct = chosenActualSpan !== undefined && Math.abs(answer - chosenActualSpan) <= tolerance;
              setState((current) => ({ ...current, riverSpanStudent: Number.isFinite(answer) ? answer : current.riverSpanStudent }));
              recordAttempt(6, answer, correct, correct ? undefined : 'MEASUREMENT_ERROR', 'MEASUREMENTS', `River span measured: ${answer.toFixed(1)} simulation m at ${selectedSite.name}.`);
              setDecisionFeedback(6, correct ? `Measurement accepted within the ±${tolerance} m survey tolerance.` : 'Your reading is outside the accepted survey tolerance. Reposition the measuring tool and try again.');
            }}>Record measurement</button><button className="btn btn-ghost" type="button" onClick={() => useHint(6)}>Hint</button></div>
            {hintText(6) && <p className="hint-box">{hintText(6)}</p>}
          </>}
          {feedback[6] && <p className="action-feedback">{feedback[6]}</p>}
        </article>

        <article className={taskClass(7)}>
          <div><span>Project brief</span><h3>The planning brief specifies a required walkway width of <b>{scenario.walkwayRequirementMetres} simulation m</b>. Enter the width that must be carried into the design.</h3></div>
          {numberInput(7, 'Required walkway width')}
          <button className="btn btn-primary" type="button" onClick={() => {
            const answer = Number(responses[7]);
            const correct = Math.abs(answer - scenario.walkwayRequirementMetres) < 0.01;
            setState((current) => ({ ...current, walkwaySelected: answer }));
            recordAttempt(7, answer, correct, correct ? undefined : 'MEASUREMENT_ERROR', 'MEASUREMENTS', `Required walkway width recorded: ${scenario.walkwayRequirementMetres} simulation m.`);
            setDecisionFeedback(7, correct ? 'Width requirement transferred correctly to the design brief.' : 'Use the specified width from the project brief, not an estimated width.');
          }}>Transfer to design brief</button>
          {feedback[7] && <p className="action-feedback">{feedback[7]}</p>}
        </article>

        <article className={taskClass(8)}>
          <div><span>Environmental investigation</span><h3>Seasonal evidence shows river levels may rise by about {scenario.floodRiseMetres} simulation m. Should this information be carried into later planning and testing?</h3></div>
          <div className="choice-grid"><button type="button" onClick={() => {
            setState((current) => ({ ...current, floodIdentified: true }));
            recordAttempt(8, true, true, undefined, 'ENVIRONMENTAL_INFORMATION', `Seasonal flood-rise evidence identified: ${scenario.floodRiseMetres} simulation m.`);
            setDecisionFeedback(8, 'Environmental evidence recorded. Its importance will become clear later in the project.');
          }}>Record seasonal flood evidence</button><button type="button" onClick={() => {
            setState((current) => ({ ...current, floodIdentified: false }));
            recordAttempt(8, false, false, 'ENVIRONMENTAL_REASONING_ERROR');
            setDecisionFeedback(8, 'Decision recorded. The project will continue with the information you chose to carry forward.');
          }}>Do not include it in planning</button></div>
          {feedback[8] && <p className="action-feedback">{feedback[8]}</p>}
        </article>

        <article className={taskClass(9)}>
          <div><span>Planning board</span><h3>Prepare the scale representation for the selected crossing.</h3></div>
          <div className="evidence-strip"><b>Scale:</b> 1 cm represents {scenario.scaleMetresPerCm} simulation m</div>
          {workingBoard(9)}
          {numberInput(9, 'Drawing length in cm')}
          <div className="task-buttons"><button className="btn btn-primary" type="button" disabled={!selectedSite} onClick={() => {
            if (!selectedSite) return;
            const expected = selectedSite.spanMetres / scenario.scaleMetresPerCm;
            const answer = Number(responses[9]);
            const correct = Math.abs(answer - expected) <= 0.1;
            recordAttempt(9, answer, correct, correct ? undefined : 'SCALE_ERROR', 'SCALE_DRAWING', `Scale plan length = ${expected.toFixed(2)} cm at 1 cm : ${scenario.scaleMetresPerCm} simulation m.`);
            setDecisionFeedback(9, correct ? 'Scale plan accepted by the planning office.' : 'Recheck how many simulation metres each centimetre represents.');
          }}>Submit scale plan</button><button className="btn btn-ghost" type="button" onClick={() => useHint(9)}>Hint</button></div>
          {hintText(9) && <p className="hint-box">{hintText(9)}</p>}
          {feedback[9] && <p className="action-feedback">{feedback[9]}</p>}
        </article>

        {missionComplete(2) && <button className="mission-advance" type="button" onClick={unlockNextMission}>Your survey is complete. Report to the planning office →</button>}
      </div>
    );
  }

  function renderMissionThree() {
    return (
      <div className="project-mission-content">
        <div className="mission-narrative"><span>Planning office</span><h2>Choose the simulation system that best fits your project priorities.</h2><p>No bridge system is permanently correct. Compare the fictional Mezzo Design Cards and justify your selection for this scenario.</p></div>
        <div className="design-card-grid">{Object.values(scenario.designCards).map((card) => <button key={card.id} type="button" className={state.selectedBridgeSystem === card.id ? 'selected' : ''} onClick={() => setState((current) => ({ ...current, selectedBridgeSystem: card.id }))}><strong>{card.name}</strong><span>{card.summary}</span><small>Relative cost {card.relativeCost}/5 · Transport difficulty {card.transportDifficulty}/5 · Construction time {card.constructionTime}/5 · Availability {card.availability}/5 · Environmental suitability {card.environmentalSuitability}/5</small></button>)}</div>
        <article className={taskClass(10)}>
          <div><span>Design decision</span><h3>Explain why your selected system is suitable for this community project.</h3></div>
          <textarea rows={4} value={designReason} onChange={(event) => setDesignReason(event.target.value)} placeholder="Short justification: cost, access, transport, availability, environment or construction time..." />
          <button className="btn btn-primary" type="button" disabled={!state.selectedBridgeSystem} onClick={() => {
            const correct = Boolean(state.selectedBridgeSystem && designReason.trim().length >= 12);
            recordAttempt(10, state.selectedBridgeSystem ?? null, correct, correct ? undefined : 'LOGICAL_REASONING_ERROR', 'DESIGN_DECISIONS', `${state.selectedBridgeSystem} selected. Reason: ${designReason.trim()}`);
            setDecisionFeedback(10, correct ? 'Preliminary design system approved. The procurement team can now use its Mezzo Design Card.' : 'Give a short project-based reason for your choice before the committee approves it.');
          }}>Submit design recommendation</button>
          {feedback[10] && <p className="action-feedback">{feedback[10]}</p>}
        </article>
        {missionComplete(3) && <button className="mission-advance" type="button" onClick={unlockNextMission}>Preliminary design approved. Open the procurement office →</button>}
      </div>
    );
  }

  function renderFoundationPlaceholder() {
    return (
      <div className="project-mission-content">
        <div className="mission-narrative"><span>Engine foundation active</span><h2>{MISSION_NAMES[state.currentMission]}</h2><p>The seeded scenario, project state, autosave, notebook, decision tracking and branch selection are active. The next implementation stage will connect the procurement, budget, construction, testing, diagnosis and redesign actions to this same saved state.</p></div>
        <div className="foundation-summary">
          <strong>Current project state is preserved.</strong>
          <span>Scenario {scenario.scenarioId}</span>
          <span>Selected site: {selectedSite?.name ?? 'Not yet confirmed'}</span>
          <span>Bridge system: {state.selectedBridgeSystem ?? 'Not yet selected'}</span>
          <span>Completed assessed actions: {completedCount}</span>
        </div>
      </div>
    );
  }

  const missionContent = state.currentMission === 1 ? renderMissionOne() : state.currentMission === 2 ? renderMissionTwo() : state.currentMission === 3 ? renderMissionThree() : renderFoundationPlaceholder();

  return (
    <section className="footbridge-project-engine">
      <div className="footbridge-project-topbar">
        <div><span className="eyebrow">MEZZO VR · COMMUNITY DEVELOPMENT PROJECT</span><h1>Connecting Communities: The Footbridge Challenge</h1><p>Investigate the problem, survey the river, plan the project and make mathematics visible in the world around you.</p></div>
        <div className="scenario-card"><span>Scenario</span><strong>{scenario.scenarioId}</strong><small>Seed {scenario.seed}</small><button type="button" onClick={startNewScenario}>New community project</button></div>
      </div>

      <div className="simulation-safety-notice"><strong>Educational simulation</strong><span>{SAFETY_NOTICE}</span></div>

      <div className="project-progress-row"><div><span>Project progress</span><strong>{progressPercent}%</strong></div><i><b style={{ width: `${progressPercent}%` }} /></i><small>Autosaved on this device · database sync will be connected to the Mezzo account layer next.</small></div>

      <nav className="mission-roadmap" aria-label="Footbridge project missions">
        {(Object.keys(MISSION_NAMES) as unknown as MissionId[]).map((missionId) => {
          const numericId = Number(missionId) as MissionId;
          const unlocked = numericId <= state.highestUnlockedMission;
          const complete = missionComplete(numericId);
          return <button key={numericId} type="button" disabled={!unlocked} className={`${state.currentMission === numericId ? 'active' : ''} ${complete ? 'complete' : ''}`} onClick={() => unlocked && setState((current) => ({ ...current, currentMission: numericId }))}><span>{numericId}</span><strong>{MISSION_NAMES[numericId]}</strong></button>;
        })}
      </nav>

      {missionContent}
    </section>
  );
}
