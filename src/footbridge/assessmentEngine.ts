import { FootbridgeProjectState } from './types';

export interface CompetencyReport {
  mathematicalAccuracy: number;
  measurementAndData: number;
  planningAndReasoning: number;
  resourceAndBudget: number;
  inspectionAndDiagnosis: number;
  environmentalAwareness: number;
  redesignAndReflection: number;
  total: number;
}

function recordScore(state: FootbridgeProjectState, id: number) {
  const record = state.decisionRecords[id];
  if (!record || record.attempts.length === 0) return 0;
  const first = record.attempts[0];
  const latestCorrectIndex = [...record.attempts].map((attempt) => attempt.correct).lastIndexOf(true);
  if (latestCorrectIndex < 0) return 0.25;
  if (first.correct) return Math.max(0.7, 1 - record.highestHintLevel * 0.06);
  if (record.highestHintLevel === 0) return 0.9;
  if (record.highestHintLevel === 1) return 0.8;
  if (record.highestHintLevel === 2) return 0.68;
  if (record.highestHintLevel === 3) return 0.54;
  return 0.4;
}

function average(state: FootbridgeProjectState, ids: number[]) {
  if (!ids.length) return 0;
  return ids.reduce((sum, id) => sum + recordScore(state, id), 0) / ids.length;
}

function weighted(value: number, weight: number) {
  return Math.round(value * weight * 10) / 10;
}

export function buildCompetencyReport(state: FootbridgeProjectState): CompetencyReport {
  const mathematicalAccuracy = weighted(average(state, [3,4,9,12,13,14,15,16,17,18,19,20,21,22,23,24]), 30);
  const measurementAndData = weighted(average(state, [2,5,6,7,8,9]), 15);
  const planningAndReasoning = weighted(average(state, [1,5,10,11,24]), 15);
  const resourceAndBudget = weighted(average(state, [17,18,19,20,21,22,23,24]), 15);
  const inspectionBase = average(state, [25,26,27,28]);
  const diagnosisBonus = state.diagnosisCorrect ? 1 : state.diagnosisAttempts > 0 ? 0.45 : 0;
  const inspectionAndDiagnosis = weighted((inspectionBase * 0.7) + (diagnosisBonus * 0.3), 10);
  const environmentalAwareness = weighted(average(state, [8,29]), 5);
  let redesignValue = average(state, [30]);
  if (state.redesignCount > 0) redesignValue = Math.max(redesignValue, state.diagnosisCorrect ? 0.9 : 0.65);
  else if (state.normalTestStatus === 'STABLE' && state.peakTestStatus === 'STABLE' && state.environmentTestStatus === 'STABLE') redesignValue = Math.max(redesignValue, 0.75);
  const redesignAndReflection = weighted(redesignValue, 10);
  const total = Math.round((mathematicalAccuracy + measurementAndData + planningAndReasoning + resourceAndBudget + inspectionAndDiagnosis + environmentalAwareness + redesignAndReflection) * 10) / 10;
  return { mathematicalAccuracy, measurementAndData, planningAndReasoning, resourceAndBudget, inspectionAndDiagnosis, environmentalAwareness, redesignAndReflection, total };
}
