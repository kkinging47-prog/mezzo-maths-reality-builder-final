import { FOOTBRIDGE_DECISIONS } from './decisionCatalog';
import { FootbridgeProjectState, FootbridgeScenario, MissionId } from './types';

const STORAGE_KEY = 'mezzo-footbridge-project-v1';

function emptyDecisionRecords() {
  return Object.fromEntries(
    FOOTBRIDGE_DECISIONS.map((decision) => [
      decision.id,
      {
        decisionId: decision.id,
        completed: false,
        hintsUsed: 0,
        highestHintLevel: 0,
        attempts: [],
      },
    ]),
  );
}

export function createInitialFootbridgeState(scenario: FootbridgeScenario): FootbridgeProjectState {
  const now = new Date().toISOString();
  return {
    version: 1,
    scenario,
    currentMission: 1,
    highestUnlockedMission: 1,
    decisionRecords: emptyDecisionRecords(),
    notebook: {
      COMMUNITY_SURVEY: [],
      SITE_SURVEY: [],
      MEASUREMENTS: [],
      ENVIRONMENTAL_INFORMATION: [],
      SCALE_DRAWING: [],
      DESIGN_DECISIONS: [],
      CALCULATIONS: [],
      MATERIAL_ORDERS: [],
      PROCUREMENT: [],
      TRANSPORT: [],
      BUDGET: [],
      CONSTRUCTION_LOG: [],
      INSPECTION: [],
      TEST_RESULTS: [],
      DIAGNOSIS: [],
      REDESIGN: [],
      FINAL_REPORT: [],
    },
    calculatedQuantities: {},
    materialsRequired: {},
    materialsOrdered: {},
    packagesOrdered: {},
    materialsDelivered: {},
    constructionComplete: false,
    constructionDefects: [],
    inspectionFindings: [],
    testingAuthorised: false,
    diagnosisAttempts: 0,
    diagnosisCorrect: false,
    redesignCount: 0,
    competencyScores: {},
    misconceptionTags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function loadFootbridgeState(): FootbridgeProjectState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as FootbridgeProjectState;
    if (state.version !== 1 || !state.scenario?.scenarioId) return null;
    return {
      ...state,
      decisionRecords: { ...emptyDecisionRecords(), ...(state.decisionRecords ?? {}) },
      notebook: state.notebook ?? {},
      calculatedQuantities: state.calculatedQuantities ?? {},
      materialsRequired: state.materialsRequired ?? {},
      materialsOrdered: state.materialsOrdered ?? {},
      packagesOrdered: state.packagesOrdered ?? {},
      materialsDelivered: state.materialsDelivered ?? {},
      constructionDefects: state.constructionDefects ?? [],
      inspectionFindings: state.inspectionFindings ?? [],
      competencyScores: state.competencyScores ?? {},
      misconceptionTags: state.misconceptionTags ?? [],
    };
  } catch {
    return null;
  }
}

export function saveFootbridgeState(state: FootbridgeProjectState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch {
    // Local persistence is a resilience layer. A database adapter will be added separately.
  }
}

export function clearFootbridgeState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function nextMission(current: MissionId): MissionId {
  return Math.min(7, current + 1) as MissionId;
}
