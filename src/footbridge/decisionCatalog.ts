import { DecisionDefinition, MissionId } from './types';

export const MISSION_NAMES: Record<MissionId, string> = {
  1: 'Understand the Problem',
  2: 'Survey the River',
  3: 'Design the Solution',
  4: 'Procure the Materials',
  5: 'Manage the Project',
  6: 'Construct and Inspect the Bridge',
  7: 'Test, Diagnose, Redesign and Report',
};

export const FOOTBRIDGE_DECISIONS: DecisionDefinition[] = [
  { id: 1, missionId: 1, actionTitle: 'Identify the community problem', competencyTags: ['DATA_INTERPRETATION', 'PROBLEM_SOLVING'], consequenceDomain: 'reasoning' },
  { id: 2, missionId: 1, actionTitle: 'Interpret community-use information', competencyTags: ['DATA_INTERPRETATION'], consequenceDomain: 'maths-only' },
  { id: 3, missionId: 1, actionTitle: 'Calculate the distance saved', competencyTags: ['UNIT_CONVERSION', 'SUBTRACTION', 'DECIMALS'], consequenceDomain: 'maths-only' },
  { id: 4, missionId: 1, actionTitle: 'Calculate the percentage journey reduction', competencyTags: ['PERCENTAGES', 'DIVISION', 'MULTIPLICATION'], consequenceDomain: 'maths-only' },
  { id: 5, missionId: 2, actionTitle: 'Choose the most appropriate crossing location', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING', 'OPTIMISATION'], consequenceDomain: 'reasoning' },
  { id: 6, missionId: 2, actionTitle: 'Measure the river span', competencyTags: ['MEASUREMENT', 'ESTIMATION'], consequenceDomain: 'construction' },
  { id: 7, missionId: 2, actionTitle: 'Apply the required walkway width', competencyTags: ['MEASUREMENT', 'DATA_INTERPRETATION'], consequenceDomain: 'construction' },
  { id: 8, missionId: 2, actionTitle: 'Investigate seasonal flooding', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING'], consequenceDomain: 'environment' },
  { id: 9, missionId: 2, actionTitle: 'Prepare a scale representation', competencyTags: ['SCALE', 'RATIO', 'DIVISION'], consequenceDomain: 'maths-only' },
  { id: 10, missionId: 3, actionTitle: 'Select and justify a bridge simulation system', competencyTags: ['LOGICAL_REASONING', 'PLANNING', 'OPTIMISATION'], consequenceDomain: 'reasoning' },
  { id: 11, missionId: 4, actionTitle: 'Interpret the Mezzo Design Drawing', competencyTags: ['DATA_INTERPRETATION', 'PLANNING'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 12, missionId: 4, actionTitle: 'Calculate virtual design modules', competencyTags: ['DIVISION', 'ROUNDING'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 13, missionId: 4, actionTitle: 'Calculate primary member units', competencyTags: ['MULTIPLICATION', 'DIVISION'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 14, missionId: 4, actionTitle: 'Calculate deck area', competencyTags: ['AREA', 'MULTIPLICATION'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 15, missionId: 4, actionTitle: 'Calculate deck-material quantities', competencyTags: ['AREA', 'DIVISION', 'ROUNDING'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 16, missionId: 4, actionTitle: 'Calculate connections', competencyTags: ['MULTIPLICATION'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 17, missionId: 4, actionTitle: 'Calculate waste or breakage allowance', competencyTags: ['PERCENTAGES', 'MULTIPLICATION'], consequenceDomain: 'budget', branchSpecific: true },
  { id: 18, missionId: 4, actionTitle: 'Convert requirements into whole procurement packages', competencyTags: ['DIVISION', 'ROUNDING'], consequenceDomain: 'logistics', branchSpecific: true },
  { id: 19, missionId: 4, actionTitle: 'Calculate secondary resources', competencyTags: ['MULTIPLICATION', 'AREA', 'VOLUME'], consequenceDomain: 'construction', branchSpecific: true },
  { id: 20, missionId: 4, actionTitle: 'Calculate procurement cost', competencyTags: ['MONEY', 'MULTIPLICATION', 'ADDITION'], consequenceDomain: 'budget', branchSpecific: true },
  { id: 21, missionId: 5, actionTitle: 'Calculate transport requirements', competencyTags: ['DIVISION', 'ROUNDING', 'PLANNING'], consequenceDomain: 'logistics' },
  { id: 22, missionId: 5, actionTitle: 'Calculate transportation cost', competencyTags: ['MONEY', 'MULTIPLICATION'], consequenceDomain: 'budget' },
  { id: 23, missionId: 5, actionTitle: 'Calculate labour and schedule cost', competencyTags: ['MONEY', 'MULTIPLICATION', 'PLANNING'], consequenceDomain: 'budget' },
  { id: 24, missionId: 5, actionTitle: 'Prepare the complete project budget', competencyTags: ['BUDGETING', 'ADDITION', 'PERCENTAGES', 'OPTIMISATION'], consequenceDomain: 'budget' },
  { id: 25, missionId: 6, actionTitle: 'Receive and inspect delivered materials', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING'], consequenceDomain: 'construction' },
  { id: 26, missionId: 6, actionTitle: 'Complete the pre-test inspection decision', competencyTags: ['LOGICAL_REASONING', 'PLANNING'], consequenceDomain: 'construction' },
  { id: 27, missionId: 7, actionTitle: 'Run the normal-use simulation', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING'], consequenceDomain: 'construction' },
  { id: 28, missionId: 7, actionTitle: 'Run the peak-use simulation', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING'], consequenceDomain: 'construction' },
  { id: 29, missionId: 7, actionTitle: 'Run the environmental simulation', competencyTags: ['DATA_INTERPRETATION', 'LOGICAL_REASONING'], consequenceDomain: 'environment' },
  { id: 30, missionId: 7, actionTitle: 'Prepare the final project report', competencyTags: ['PLANNING', 'DATA_INTERPRETATION', 'PROBLEM_SOLVING'], consequenceDomain: 'reasoning' },
];

export function decisionsForMission(missionId: MissionId) {
  return FOOTBRIDGE_DECISIONS.filter((decision) => decision.missionId === missionId);
}
