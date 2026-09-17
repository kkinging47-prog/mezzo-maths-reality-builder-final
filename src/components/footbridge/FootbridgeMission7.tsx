import { buildCompetencyReport } from '../../footbridge/assessmentEngine';
import {
  diagnosisLabel,
  deriveProjectOutcome,
  environmentalTest,
  FailureCause,
  normalUseTest,
  peakUseTest,
  redesignMissionForCause,
} from '../../footbridge/failureEngine';
import { canonicalProcurementRequirements, selectedSupplier } from '../../footbridge/mathEngine';
import { distanceSavedMetres, journeyReductionPercent } from '../../footbridge/scenarioEngine';
import { FootbridgeController } from '../../footbridge/useFootbridgeProject';

const DIAGNOSIS_OPTIONS: FailureCause[] = [
  'PRIMARY_SHORTAGE',
  'DECK_SHORTAGE',
  'CONNECTION_SHORTAGE',
  'SECONDARY_RESOURCE_SHORTAGE',
  'DELIVERY_SHORTAGE',
  'SPAN_MEASUREMENT_SHORTFALL',
  'WALKWAY_TOO_NARROW',
  'FLOOD_RISK_IGNORED',
];

export default function FootbridgeMission7({ c }: { c: FootbridgeController }) {
  const state = c.state;
  const s = state.scenario;
  const selectedSite = s.sites.find((site) => site.id === state.selectedSiteId);
  const req = canonicalProcurementRequirements(state);
  const supplier = selectedSupplier(state);
  const task = (id: number) => (c.recordFor(id).completed ? 'project-action complete' : 'project-action');
  const failureCause = state.lastFailureCause && state.lastFailureCause !== 'NONE'
    ? state.lastFailureCause as FailureCause
    : undefined;
  const allTestsStable = state.normalTestStatus === 'STABLE' && state.peakTestStatus === 'STABLE' && state.environmentTestStatus === 'STABLE';
  const report = buildCompetencyReport(state);

  function appendNotebook(section: string, entry: string) {
    c.setState((current) => ({
      ...current,
      notebook: {
        ...current.notebook,
        [section]: [...(current.notebook[section] ?? []), entry],
      },
    }));
  }

  function runNormal() {
    if (!state.testingAuthorised) {
      c.setDecisionFeedback(27, 'Testing is locked until Mission 6 inspection authorises the project.');
      return;
    }
    const result = normalUseTest(state);
    const entry = `NORMAL-USE TEST — ${result.status}: ${result.symptom}`;
    c.setState((current) => ({
      ...current,
      normalTestStatus: result.status,
      peakTestStatus: undefined,
      environmentTestStatus: undefined,
      lastFailureCause: result.cause === 'NONE' ? undefined : result.cause,
      diagnosisCorrect: result.cause === 'NONE' ? current.diagnosisCorrect : false,
      diagnosisHintLevel: 0,
      testHistory: [...current.testHistory, entry],
    }));
    c.recordAttempt(27, result.status, true, {
      completeOnAttempt: true,
      notebookSection: 'TEST_RESULTS',
      notebookEntry: entry,
    });
    c.setDecisionFeedback(27, result.symptom);
  }

  function runPeak() {
    if (!(state.normalTestStatus === 'STABLE' || state.normalTestStatus === 'SLIGHT MOVEMENT')) {
      c.setDecisionFeedback(28, 'Peak-use testing cannot begin while the normal-use test has a serious unresolved condition.');
      return;
    }
    const result = peakUseTest(state);
    const entry = `PEAK-USE TEST — ${result.status}: ${result.symptom}`;
    c.setState((current) => ({
      ...current,
      peakTestStatus: result.status,
      environmentTestStatus: undefined,
      lastFailureCause: result.cause === 'NONE' ? undefined : result.cause,
      diagnosisCorrect: result.cause === 'NONE' ? current.diagnosisCorrect : false,
      diagnosisHintLevel: 0,
      testHistory: [...current.testHistory, entry],
    }));
    c.recordAttempt(28, result.status, true, {
      completeOnAttempt: true,
      notebookSection: 'TEST_RESULTS',
      notebookEntry: entry,
    });
    c.setDecisionFeedback(28, result.symptom);
  }

  function runEnvironment() {
    if (state.peakTestStatus !== 'STABLE') {
      c.setDecisionFeedback(29, 'The environmental test is held until peak-use testing is stable. Diagnose and correct any earlier test problem first.');
      return;
    }
    const result = environmentalTest(state);
    const entry = `ENVIRONMENTAL TEST — ${result.status}: ${result.symptom}`;
    c.setState((current) => ({
      ...current,
      environmentTestStatus: result.status,
      lastFailureCause: result.cause === 'NONE' ? undefined : result.cause,
      diagnosisCorrect: result.cause === 'NONE' ? current.diagnosisCorrect : false,
      diagnosisHintLevel: 0,
      testHistory: [...current.testHistory, entry],
    }));
    c.recordAttempt(29, result.status, true, {
      completeOnAttempt: true,
      notebookSection: 'TEST_RESULTS',
      notebookEntry: entry,
    });
    c.setDecisionFeedback(29, result.symptom);
  }

  function submitDiagnosis(cause: FailureCause) {
    if (!failureCause) return;
    const correct = cause === failureCause;
    const entry = `Diagnosis attempt ${state.diagnosisAttempts + 1}: ${diagnosisLabel(cause)} — ${correct ? 'cause confirmed' : 'not consistent with the stored project evidence'}.`;
    c.setState((current) => ({
      ...current,
      diagnosisAttempts: current.diagnosisAttempts + 1,
      diagnosisCorrect: current.diagnosisCorrect || correct,
      diagnosisHistory: [...current.diagnosisHistory, entry],
      notebook: correct ? {
        ...current.notebook,
        DIAGNOSIS: [...(current.notebook.DIAGNOSIS ?? []), entry],
      } : current.notebook,
    }));
  }

  function useDiagnosisHint() {
    c.setState((current) => ({
      ...current,
      diagnosisHintsUsed: current.diagnosisHintsUsed + 1,
      diagnosisHintLevel: Math.min(4, current.diagnosisHintLevel + 1),
    }));
  }

  function openRedesign() {
    if (!failureCause || !state.diagnosisCorrect) return;
    const target = redesignMissionForCause(failureCause);
    const now = new Date().toISOString();
    const redesignEntry = `Redesign cycle ${state.redesignCount + 1}: ${diagnosisLabel(failureCause)}. Return to Mission ${target} for correction, then reconstruct, inspect and retest.`;
    c.setState((current) => {
      const records = { ...current.decisionRecords };
      [25, 26, 27, 28, 29, 30].forEach((id) => {
        records[id] = { ...records[id], completed: false, completedAt: undefined };
      });
      return {
        ...current,
        currentMission: target,
        highestUnlockedMission: 7,
        redesignTargetMission: target,
        redesignCount: current.redesignCount + 1,
        redesignHistory: [...current.redesignHistory, redesignEntry],
        notebook: {
          ...current.notebook,
          REDESIGN: [...(current.notebook.REDESIGN ?? []), redesignEntry],
        },
        decisionRecords: records,
        materialsDelivered: {},
        constructionComplete: false,
        constructionDefects: [],
        inspectionFindings: [],
        testingAuthorised: false,
        normalTestStatus: undefined,
        peakTestStatus: undefined,
        environmentTestStatus: undefined,
        lastFailureCause: undefined,
        diagnosisCorrect: false,
        diagnosisHintLevel: 0,
        finalProjectStatus: undefined,
        finalReportGeneratedAt: undefined,
        projectCompletedAt: undefined,
        updatedAt: now,
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function generateFinalReport() {
    const reflection = c.response('final-reflection').trim();
    if (!allTestsStable) {
      c.setDecisionFeedback(30, 'The final project report cannot be approved while a staged test remains unresolved. Diagnose, redesign and retest first.');
      return;
    }
    if (reflection.length < 12) {
      c.setDecisionFeedback(30, 'Add a short reflection on what your mathematics changed in the project.');
      return;
    }
    const now = new Date().toISOString();
    const outcome = deriveProjectOutcome(state);
    c.recordAttempt(30, reflection, true, {
      completeOnAttempt: true,
      notebookSection: 'FINAL_REPORT',
      notebookEntry: `Final report approved. Outcome: ${outcome}. Learner reflection: ${reflection}`,
    });
    c.setState((current) => ({
      ...current,
      finalProjectStatus: deriveProjectOutcome(current),
      finalReflection: reflection,
      finalReportGeneratedAt: now,
      projectCompletedAt: now,
    }));
    c.setDecisionFeedback(30, 'Project report generated. Adom and Nkabom can now see the complete project outcome and mathematics competency report.');
  }

  return <div className="project-mission-content">
    <div className="mission-narrative testing-narrative">
      <span>Mission 7 · Testing and project review</span>
      <h2>Your decisions now meet the virtual world.</h2>
      <p>Your investigation is complete. Your measurements have been taken. Your calculations determined the materials. The project has been constructed. It is now time to see whether your decisions work together.</p>
    </div>

    {!state.testingAuthorised && <div className="locked-note">Return to Mission 6 and complete the pre-test inspection before starting the test sequence.</div>}

    <div className="test-sequence" aria-label="Three-stage project testing">
      <TestCard number="01" title="Normal-use test" status={state.normalTestStatus} enabled={state.testingAuthorised} onRun={runNormal} text={`Introduce ordinary pedestrian use gradually across the ${selectedSite?.name ?? 'selected crossing'}.`} />
      <TestCard number="02" title="Peak-use test" status={state.peakTestStatus} enabled={state.normalTestStatus === 'STABLE' || state.normalTestStatus === 'SLIGHT MOVEMENT'} onRun={runPeak} text={`Increase the simulation toward the scenario peak of ${s.peakUsers} simultaneous users.`} />
      <TestCard number="03" title="Environmental test" status={state.environmentTestStatus} enabled={state.peakTestStatus === 'STABLE'} onRun={runEnvironment} text={`Introduce rain and a ${s.floodRiseMetres} simulation-metre seasonal river rise.`} />
    </div>

    {c.feedback[27] && <p className="test-observation"><b>Normal-use observation:</b> {c.feedback[27]}</p>}
    {c.feedback[28] && <p className="test-observation"><b>Peak-use observation:</b> {c.feedback[28]}</p>}
    {c.feedback[29] && <p className="test-observation"><b>Environmental observation:</b> {c.feedback[29]}</p>}

    {failureCause && <section className="diagnosis-console">
      <div className="diagnosis-heading"><div><span>TESTING PAUSED · DIAGNOSTIC MODE</span><h3>Investigate the observable symptom before changing the project.</h3></div><strong>{latestSymptom(state.testHistory)}</strong></div>
      <p>Do not guess from a hidden answer. Use your notebook, survey, calculations, orders, delivery log and inspection evidence to identify the most likely cause.</p>
      <div className="diagnosis-grid">{DIAGNOSIS_OPTIONS.map((cause) => <button key={cause} type="button" className={state.diagnosisCorrect && cause === failureCause ? 'confirmed' : ''} onClick={() => submitDiagnosis(cause)}>{diagnosisLabel(cause)}</button>)}</div>
      <div className="task-buttons"><button className="btn btn-ghost" type="button" onClick={useDiagnosisHint}>Progressive hint {Math.min(4, state.diagnosisHintLevel + 1)}/4</button>{state.diagnosisCorrect && <button className="btn btn-primary" type="button" onClick={openRedesign}>Open targeted redesign stage</button>}</div>
      {state.diagnosisHintLevel > 0 && <p className="hint-box">{diagnosisHint(failureCause, state.diagnosisHintLevel)}</p>}
      <small>{state.diagnosisAttempts} diagnosis attempt(s) · {state.diagnosisHintsUsed} diagnosis hint(s) used</small>
      {state.diagnosisCorrect && <p className="diagnosis-success">Cause confirmed from the project evidence. You can correct only the relevant stage; the rest of your work will remain saved.</p>}
    </section>}

    {allTestsStable && <article className={task(30)}>
      <div><span>Final project report</span><h3>Review the automatically assembled evidence, then add your learner reflection.</h3></div>
      <div className="final-report-preview">
        <ReportRow label="Community problem" value="Adom and Nkabom are separated by the river, creating a long detour." />
        <ReportRow label="Selected crossing" value={selectedSite?.name ?? 'Not recorded'} />
        <ReportRow label="Measured river span" value={`${state.riverSpanStudent ?? '—'} simulation m`} />
        <ReportRow label="Required walkway width" value={`${s.walkwayRequirementMetres} simulation m`} />
        <ReportRow label="Community-use data" value={`${s.dailyUsers} daily users; ${s.peakUsers} peak simultaneous users`} />
        <ReportRow label="Environmental data" value={`${s.floodRiseMetres} simulation m seasonal rise; evidence ${state.floodIdentified ? 'identified' : 'not carried forward'}`} />
        <ReportRow label="Scale plan" value={lastNotebookEntry(state.notebook.SCALE_DRAWING)} />
        <ReportRow label="Bridge system" value={state.selectedBridgeSystem ? s.designCards[state.selectedBridgeSystem].name : 'Not recorded'} />
        <ReportRow label="Reason for selection" value={lastNotebookEntry(state.notebook.DESIGN_DECISIONS)} />
        <ReportRow label="Material quantities" value={req ? `Primary ${req.primaryUnits}; deck ${req.deckUnits}; connections ${req.connections}; secondary ${req.secondaryBaseUnits}` : 'Not available'} />
        <ReportRow label="Package orders" value={`Primary ${state.packagesOrdered.primary ?? 0}; deck ${state.packagesOrdered.deck ?? 0}; secondary ${state.packagesOrdered.secondary ?? 0}`} />
        <ReportRow label="Transport plan" value={`${state.tripsOrdered ?? 0} trip(s) via ${supplier.name}`} />
        <ReportRow label="Material cost" value={`GHS ${(state.materialCost ?? 0).toFixed(2)}`} />
        <ReportRow label="Transport cost" value={`GHS ${(state.transportCost ?? 0).toFixed(2)}`} />
        <ReportRow label="Labour cost" value={`GHS ${(state.labourCost ?? 0).toFixed(2)}`} />
        <ReportRow label="Total cost" value={`GHS ${(state.totalCost ?? 0).toFixed(2)} against GHS ${s.communityBudget.toFixed(2)} budget`} />
        <ReportRow label="Inspection findings" value={state.inspectionFindings.join(' | ') || 'No blocking concern recorded at final inspection.'} />
        <ReportRow label="Normal test" value={state.normalTestStatus ?? 'Not run'} />
        <ReportRow label="Peak-use test" value={state.peakTestStatus ?? 'Not run'} />
        <ReportRow label="Environmental test" value={state.environmentTestStatus ?? 'Not run'} />
        <ReportRow label="Failures encountered" value={state.testHistory.filter((item) => !item.includes('— STABLE')).join(' | ') || 'No unresolved test failure.'} />
        <ReportRow label="Diagnosis" value={state.diagnosisHistory.join(' | ') || 'No diagnosis cycle required.'} />
        <ReportRow label="Redesign actions" value={state.redesignHistory.join(' | ') || 'No redesign cycle required.'} />
      </div>
      <textarea rows={4} value={c.response('final-reflection')} onChange={(event) => c.setResponse('final-reflection', event.target.value)} placeholder="Reflection: What did your mathematics change in this project? What would you check first on another community project?" />
      <button className="btn btn-primary" type="button" onClick={generateFinalReport}>Generate final project report</button>
      {c.feedback[30] && <p className="action-feedback">{c.feedback[30]}</p>}
    </article>}

    {state.finalProjectStatus && <section className="project-result-board">
      <div className="project-outcome-card"><span>OUTPUT A · PROJECT OUTCOME</span><h2>{state.finalProjectStatus}</h2><p>{state.redesignCount > 0 ? 'Your first solution developed a problem during testing. You investigated the evidence, corrected the relevant project stage and improved the project.' : 'Your project decisions worked together through normal-use, peak-use and environmental testing.'}</p></div>
      <div className="community-impact-card"><span>COMMUNITY IMPACT</span><h3>Adom and Nkabom are now connected.</h3><p>Your project reduced the typical journey by {(distanceSavedMetres(s) / 1000).toFixed(2)} km — about {journeyReductionPercent(s).toFixed(1)}%.</p><div><b>{s.schoolchildren}</b><span>schoolchildren represented in the daily-use data</span><b>{s.farmers}</b><span>farmers represented</span><b>{s.traders}</b><span>traders represented</span></div></div>
      <div className="competency-report"><span>OUTPUT B · MATHEMATICS COMPETENCY REPORT</span><h3>{report.total}/100</h3><div><ScoreRow label="Mathematical accuracy" score={report.mathematicalAccuracy} max={30}/><ScoreRow label="Measurement & data interpretation" score={report.measurementAndData} max={15}/><ScoreRow label="Planning & reasoning" score={report.planningAndReasoning} max={15}/><ScoreRow label="Resource & budget management" score={report.resourceAndBudget} max={15}/><ScoreRow label="Inspection & diagnosis" score={report.inspectionAndDiagnosis} max={10}/><ScoreRow label="Environmental awareness" score={report.environmentalAwareness} max={5}/><ScoreRow label="Redesign & reflection" score={report.redesignAndReflection} max={10}/></div></div>
      <div className="final-actions"><button className="btn btn-ghost" type="button" onClick={() => window.print()}>Print project report</button><button className="btn btn-primary" type="button" onClick={c.startNewScenario}>New community project</button></div>
    </section>}
  </div>;
}

function TestCard({ number, title, status, enabled, onRun, text }: { number: string; title: string; status?: string; enabled: boolean; onRun: () => void; text: string }) {
  return <article className={`test-stage ${status ? status.toLowerCase().replace(/ /g, '-') : ''}`}><span>{number}</span><h3>{title}</h3><p>{text}</p><strong>{status ?? 'READY WHEN UNLOCKED'}</strong><button type="button" disabled={!enabled} onClick={onRun}>{status ? 'Run test again' : 'Run test'}</button></article>;
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return <div><b>{label}</b><span>{value}</span></div>;
}

function ScoreRow({ label, score, max }: { label: string; score: number; max: number }) {
  return <div><span>{label}</span><b>{score}/{max}</b><i><em style={{ width: `${Math.min(100, (score / max) * 100)}%` }} /></i></div>;
}

function lastNotebookEntry(entries: string[] | undefined) {
  if (!entries || entries.length === 0) return 'Not recorded';
  return entries[entries.length - 1];
}

function latestSymptom(history: string[]) {
  if (!history.length) return 'Testing has detected an issue. Inspect the available project evidence.';
  return history[history.length - 1];
}

function diagnosisHint(cause: FailureCause, level: number) {
  if (level <= 1) return 'Guiding question: which earlier project decision could logically create the symptom you can now observe?';
  if (level === 2) {
    if (cause === 'DELIVERY_SHORTAGE') return 'Compare the delivery log with the transport capacity and the number of trips you scheduled.';
    if (cause === 'SPAN_MEASUREMENT_SHORTFALL' || cause === 'WALKWAY_TOO_NARROW') return 'Return to your survey measurements and the project brief before checking procurement.';
    if (cause === 'FLOOD_RISK_IGNORED' || cause === 'SECONDARY_RESOURCE_SHORTAGE') return 'Review the environmental evidence and the fictional protection-resource record.';
    return 'Compare required quantities, ordered quantities and the inventory that physically reached the construction site.';
  }
  if (level === 3) {
    if (cause === 'DELIVERY_SHORTAGE') return 'Relationship: delivery capacity = whole trips × vehicle capacity. Compare that capacity with the total ordered delivery units.';
    if (cause === 'WALKWAY_TOO_NARROW') return 'Relationship: selected walkway width must be at least the width stated in the project brief.';
    if (cause === 'SPAN_MEASUREMENT_SHORTFALL') return 'Relationship: later design calculations inherit the river span recorded during the survey.';
    if (cause === 'FLOOD_RISK_IGNORED') return 'Trace whether the seasonal flood evidence discovered during the river survey was carried into planning.';
    return 'Relationship: delivered quantity must be at least the fictional design requirement for each required component category.';
  }
  return `Full diagnostic support: the stored project evidence points to “${diagnosisLabel(cause)}”. Correct that project stage, reconstruct, inspect and retest.`;
}
