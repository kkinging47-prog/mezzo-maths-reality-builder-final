import { canonicalProcurementRequirements, orderedMaterialUnits, selectedSiteSpan } from './mathEngine';
import { FootbridgeProjectState, ProjectOutcome } from './types';

export type FailureCause =
  | 'NONE'
  | 'PRIMARY_SHORTAGE'
  | 'DECK_SHORTAGE'
  | 'CONNECTION_SHORTAGE'
  | 'SECONDARY_RESOURCE_SHORTAGE'
  | 'DELIVERY_SHORTAGE'
  | 'SPAN_MEASUREMENT_SHORTFALL'
  | 'WALKWAY_TOO_NARROW'
  | 'FLOOD_RISK_IGNORED';

export type ProgressiveStatus =
  | 'STABLE'
  | 'SLIGHT MOVEMENT'
  | 'WARNING'
  | 'EXCESSIVE MOVEMENT'
  | 'TEST STOPPED'
  | 'PARTIAL SIMULATED FAILURE'
  | 'MAJOR SIMULATED FAILURE';

const ORDER_KEYS = ['primary', 'deck', 'connections', 'secondary'] as const;

export function deriveDelivery(state: FootbridgeProjectState) {
  const ordered = orderedMaterialUnits(state);
  const totalOrdered = ORDER_KEYS.reduce((sum, key) => sum + ordered[key], 0);
  const tripCapacity = Math.max(0, state.tripsOrdered ?? 0) * state.scenario.vehicleCapacityUnits;
  if (totalOrdered <= tripCapacity) {
    return { delivered: { ...ordered }, totalOrdered, tripCapacity, undelivered: { primary: 0, deck: 0, connections: 0, secondary: 0 } };
  }

  const ratio = totalOrdered > 0 ? Math.min(1, tripCapacity / totalOrdered) : 1;
  const delivered = {
    primary: Math.floor(ordered.primary * ratio),
    deck: Math.floor(ordered.deck * ratio),
    connections: Math.floor(ordered.connections * ratio),
    secondary: Math.floor(ordered.secondary * ratio),
  };
  let used = ORDER_KEYS.reduce((sum, key) => sum + delivered[key], 0);
  let remaining = Math.max(0, tripCapacity - used);
  let cursor = 0;
  while (remaining > 0 && cursor < 100000) {
    const key = ORDER_KEYS[cursor % ORDER_KEYS.length];
    if (delivered[key] < ordered[key]) {
      delivered[key] += 1;
      remaining -= 1;
      used += 1;
    }
    if (ORDER_KEYS.every((item) => delivered[item] >= ordered[item])) break;
    cursor += 1;
  }

  return {
    delivered,
    totalOrdered,
    tripCapacity,
    undelivered: {
      primary: ordered.primary - delivered.primary,
      deck: ordered.deck - delivered.deck,
      connections: ordered.connections - delivered.connections,
      secondary: ordered.secondary - delivered.secondary,
    },
  };
}

export function deriveConstructionAssessment(state: FootbridgeProjectState) {
  const trueReq = canonicalProcurementRequirements(state);
  if (!trueReq) {
    return {
      defects: ['DESIGN_NOT_SELECTED'],
      constructionComplete: false,
      primaryFailureCause: 'PRIMARY_SHORTAGE' as FailureCause,
      shortages: {},
      overages: {},
    };
  }
  const delivered = state.materialsDelivered;
  const primary = delivered.primary ?? 0;
  const deck = delivered.deck ?? 0;
  const connections = delivered.connections ?? 0;
  const secondary = delivered.secondary ?? 0;
  const defects: string[] = [];
  const shortages: Record<string, number> = {};
  const overages: Record<string, number> = {};

  const compare = (key: string, have: number, need: number, defect: string) => {
    if (have < need) { shortages[key] = need - have; defects.push(defect); }
    if (have > need) overages[key] = have - need;
  };
  compare('primary', primary, trueReq.primaryUnits, 'PRIMARY_SHORTAGE');
  compare('deck', deck, trueReq.deckUnits, 'DECK_SHORTAGE');
  compare('connections', connections, trueReq.connections, 'CONNECTION_SHORTAGE');
  compare('secondary', secondary, trueReq.secondaryBaseUnits, 'SECONDARY_RESOURCE_SHORTAGE');

  const actualSpan = selectedSiteSpan(state);
  const measured = state.riverSpanStudent ?? actualSpan;
  if (measured + 0.1 < actualSpan) defects.push('SPAN_MEASUREMENT_SHORTFALL');
  if ((state.walkwaySelected ?? state.scenario.walkwayRequirementMetres) + 0.01 < state.scenario.walkwayRequirementMetres) defects.push('WALKWAY_TOO_NARROW');
  if (state.floodIdentified === false) defects.push('FLOOD_RISK_IGNORED');

  const delivery = deriveDelivery(state);
  if (Object.values(delivery.undelivered).some((value) => value > 0)) defects.push('DELIVERY_SHORTAGE');

  const constructionComplete = !defects.includes('PRIMARY_SHORTAGE') && !defects.includes('DECK_SHORTAGE') && !defects.includes('SPAN_MEASUREMENT_SHORTFALL');
  const priority: FailureCause[] = [
    'DECK_SHORTAGE','PRIMARY_SHORTAGE','SPAN_MEASUREMENT_SHORTFALL','CONNECTION_SHORTAGE','WALKWAY_TOO_NARROW','DELIVERY_SHORTAGE','SECONDARY_RESOURCE_SHORTAGE','FLOOD_RISK_IGNORED','NONE',
  ];
  const primaryFailureCause = priority.find((cause) => cause === 'NONE' || defects.includes(cause)) ?? 'NONE';
  return { defects, constructionComplete, primaryFailureCause, shortages, overages };
}

export function deliveryCondition(state: FootbridgeProjectState) {
  const assessment = deriveConstructionAssessment(state);
  const hasShortage = Object.values(assessment.shortages).some((value) => value > 0) || assessment.defects.includes('DELIVERY_SHORTAGE');
  const hasExcess = Object.values(assessment.overages).some((value) => value > 0);
  if (hasShortage && hasExcess) return 'mixed';
  if (hasShortage) return 'shortage';
  if (hasExcess) return 'excess';
  return 'complete';
}

export function inspectionShouldApprove(state: FootbridgeProjectState) {
  const assessment = deriveConstructionAssessment(state);
  const blocking = ['DECK_SHORTAGE','PRIMARY_SHORTAGE','SPAN_MEASUREMENT_SHORTFALL','CONNECTION_SHORTAGE'];
  return !assessment.defects.some((defect) => blocking.includes(defect));
}

export function normalUseTest(state: FootbridgeProjectState): { status: ProgressiveStatus; symptom: string; cause: FailureCause } {
  const a = deriveConstructionAssessment(state);
  if (!a.constructionComplete) {
    const cause = a.primaryFailureCause;
    return { status: 'TEST STOPPED', cause, symptom: symptomForCause(cause, 'normal') };
  }
  const req = canonicalProcurementRequirements(state)!;
  const connectionRatio = req.connections > 0 ? (state.materialsDelivered.connections ?? 0) / req.connections : 1;
  if (connectionRatio < 0.7) return { status: 'MAJOR SIMULATED FAILURE', cause: 'CONNECTION_SHORTAGE', symptom: 'Large movement develops around multiple simulated connection zones. The test system stops the crossing immediately.' };
  if (connectionRatio < 0.9) return { status: 'EXCESSIVE MOVEMENT', cause: 'CONNECTION_SHORTAGE', symptom: 'Excessive movement is detected around a connection area. The test is stopped before the next loading stage.' };
  if (connectionRatio < 1) return { status: 'SLIGHT MOVEMENT', cause: 'CONNECTION_SHORTAGE', symptom: 'A small but noticeable movement is detected near one simulated connection area.' };
  return { status: 'STABLE', cause: 'NONE', symptom: 'The virtual bridge remains stable during normal pedestrian use.' };
}

export function peakUseTest(state: FootbridgeProjectState): { status: ProgressiveStatus; symptom: string; cause: FailureCause } {
  const normal = normalUseTest(state);
  if (normal.status === 'TEST STOPPED' || normal.status === 'MAJOR SIMULATED FAILURE' || normal.status === 'EXCESSIVE MOVEMENT') return normal;
  const width = state.walkwaySelected ?? state.scenario.walkwayRequirementMetres;
  if (width + 0.01 < state.scenario.walkwayRequirementMetres) {
    return { status: 'WARNING', cause: 'WALKWAY_TOO_NARROW', symptom: 'As peak-use numbers increase, pedestrian flow becomes restricted and crowding develops on the virtual walkway.' };
  }
  const req = canonicalProcurementRequirements(state)!;
  const connectionRatio = req.connections > 0 ? (state.materialsDelivered.connections ?? 0) / req.connections : 1;
  if (connectionRatio < 1) return { status: 'EXCESSIVE MOVEMENT', cause: 'CONNECTION_SHORTAGE', symptom: 'Movement increases as the simulated crowd reaches peak-use conditions. Testing is paused.' };
  return { status: 'STABLE', cause: 'NONE', symptom: `The bridge remains stable as simulated use increases toward the scenario peak of ${state.scenario.peakUsers} people.` };
}

export function environmentalTest(state: FootbridgeProjectState): { status: ProgressiveStatus; symptom: string; cause: FailureCause } {
  const a = deriveConstructionAssessment(state);
  if (!state.floodIdentified) return { status: 'WARNING', cause: 'FLOOD_RISK_IGNORED', symptom: 'As the virtual river rises, the environmental monitoring system detects a condition that was not carried into the project plan.' };
  if (a.defects.includes('SECONDARY_RESOURCE_SHORTAGE')) return { status: 'WARNING', cause: 'SECONDARY_RESOURCE_SHORTAGE', symptom: 'After prolonged simulated rain exposure, a protective-condition warning appears on part of the project.' };
  return { status: 'STABLE', cause: 'NONE', symptom: `The project remains stable during the fictional environmental test with a ${state.scenario.floodRiseMetres} m simulated seasonal rise.` };
}

export function symptomForCause(cause: FailureCause, stage: 'normal' | 'peak' | 'environment' = 'normal') {
  const map: Record<FailureCause,string> = {
    NONE: 'No abnormal condition is detected.',
    PRIMARY_SHORTAGE: 'The inspection system detects an incomplete sequence of primary virtual components, so testing cannot proceed.',
    DECK_SHORTAGE: 'A continuous walking surface has not been completed. A visible gap remains in the deck and testing is stopped.',
    CONNECTION_SHORTAGE: stage === 'peak' ? 'Movement increases around a connection zone as simulated use rises.' : 'Movement is detected around a simulated connection zone.',
    SECONDARY_RESOURCE_SHORTAGE: 'An environmental protection warning appears after simulated exposure.',
    DELIVERY_SHORTAGE: 'The delivery inventory shows that some ordered materials never reached the construction site.',
    SPAN_MEASUREMENT_SHORTFALL: 'The constructed virtual span does not fully align with both surveyed bank points.',
    WALKWAY_TOO_NARROW: 'Peak-use flow becomes restricted and crowding develops on the virtual walkway.',
    FLOOD_RISK_IGNORED: 'The environmental test reveals a rising-water condition not represented in the project planning record.',
  };
  return map[cause];
}

export function diagnosisLabel(cause: FailureCause) {
  const map: Record<FailureCause,string> = {
    NONE:'No project defect',
    PRIMARY_SHORTAGE:'Not enough primary components reached the construction site',
    DECK_SHORTAGE:'The deck-material quantity is insufficient',
    CONNECTION_SHORTAGE:'The connection-token schedule is insufficient',
    SECONDARY_RESOURCE_SHORTAGE:'The fictional protective resource is insufficient',
    DELIVERY_SHORTAGE:'The transport plan did not deliver the full order',
    SPAN_MEASUREMENT_SHORTFALL:'The recorded river measurement was shorter than the selected crossing',
    WALKWAY_TOO_NARROW:'The selected walkway width is below the project brief',
    FLOOD_RISK_IGNORED:'Seasonal flood evidence was not carried into planning',
  };
  return map[cause];
}

export function redesignMissionForCause(cause: FailureCause): 2 | 4 | 5 | 6 {
  if (cause === 'SPAN_MEASUREMENT_SHORTFALL' || cause === 'WALKWAY_TOO_NARROW' || cause === 'FLOOD_RISK_IGNORED') return 2;
  if (cause === 'DELIVERY_SHORTAGE') return 5;
  if (cause === 'PRIMARY_SHORTAGE' || cause === 'DECK_SHORTAGE' || cause === 'CONNECTION_SHORTAGE' || cause === 'SECONDARY_RESOURCE_SHORTAGE') return 4;
  return 6;
}

export function deriveProjectOutcome(state: FootbridgeProjectState): ProjectOutcome {
  const a = deriveConstructionAssessment(state);
  if (!a.constructionComplete) return 'CONSTRUCTION INCOMPLETE';
  if (state.normalTestStatus && state.normalTestStatus !== 'STABLE' && state.normalTestStatus !== 'SLIGHT MOVEMENT') return 'LOAD TEST FAILURE';
  if (state.peakTestStatus && state.peakTestStatus !== 'STABLE') return 'LOAD TEST FAILURE';
  if (state.environmentTestStatus && state.environmentTestStatus !== 'STABLE') return 'ENVIRONMENTAL TEST FAILURE';
  const submittedOverBudget = (state.totalCost ?? 0) > state.scenario.communityBudget;
  if (submittedOverBudget) return 'STRUCTURALLY SUCCESSFUL – OVER BUDGET';
  if (state.redesignCount > 0) return 'APPROVED AFTER REDESIGN';
  if (state.normalTestStatus === 'STABLE' && state.peakTestStatus === 'STABLE' && state.environmentTestStatus === 'STABLE') return 'PROJECT APPROVED';
  return 'MODIFICATION REQUIRED';
}
