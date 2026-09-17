export type DifficultyLevel = 1 | 2 | 3;
export type BridgeSystemId = 'timber' | 'steel' | 'reinforced-concrete';
export type MissionId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CompetencyTag =
  | 'MEASUREMENT'
  | 'UNIT_CONVERSION'
  | 'ADDITION'
  | 'SUBTRACTION'
  | 'MULTIPLICATION'
  | 'DIVISION'
  | 'DECIMALS'
  | 'FRACTIONS'
  | 'PERCENTAGES'
  | 'RATIO'
  | 'SCALE'
  | 'AREA'
  | 'VOLUME'
  | 'ROUNDING'
  | 'ESTIMATION'
  | 'MONEY'
  | 'BUDGETING'
  | 'DATA_INTERPRETATION'
  | 'PROBLEM_SOLVING'
  | 'LOGICAL_REASONING'
  | 'PLANNING'
  | 'OPTIMISATION';

export type MisconceptionTag =
  | 'UNIT_CONVERSION_ERROR'
  | 'PERCENTAGE_ERROR'
  | 'ROUNDING_PACK_SIZE_ERROR'
  | 'AREA_ERROR'
  | 'VOLUME_ERROR'
  | 'MULTIPLICATION_ERROR'
  | 'DIVISION_ERROR'
  | 'BUDGET_TOTAL_ERROR'
  | 'SCALE_ERROR'
  | 'MEASUREMENT_ERROR'
  | 'DATA_INTERPRETATION_ERROR'
  | 'TRANSPORT_CAPACITY_ERROR'
  | 'ENVIRONMENTAL_REASONING_ERROR'
  | 'PROCUREMENT_ERROR'
  | 'LOGICAL_REASONING_ERROR';

export type ConsequenceDomain = 'maths-only' | 'budget' | 'logistics' | 'construction' | 'environment' | 'reasoning';

export interface CrossingSite {
  id: 'site-a' | 'site-b' | 'site-c';
  name: string;
  spanMetres: number;
  accessRating: number;
  environmentalRating: number;
  convenienceRating: number;
  costFactor: number;
  narrative: string;
}

export interface SupplierOption {
  id: string;
  name: string;
  unitPrice: number;
  packageSize: number;
  deliveryCostPerTrip: number;
  availabilityRating: number;
}

export interface SimulationDesignCard {
  id: BridgeSystemId;
  name: string;
  summary: string;
  relativeCost: number;
  transportDifficulty: number;
  maintenanceLevel: number;
  constructionTime: number;
  availability: number;
  environmentalSuitability: number;
  simulationDurability: number;
  moduleLength: number;
  deckUnitArea: number;
  memberUnitsPerModule: number;
  crossMembersPerModule: number;
  connectionsPerCrossMember: number;
  fastenersPerConnection: number;
  primaryPackageSize: number;
  secondaryResourcePerSquareMetre: number;
  secondaryPackageSize: number;
  primaryUnitPrice: number;
  deckUnitPrice: number;
  connectionUnitPrice: number;
  secondaryUnitPrice: number;
}

export interface FootbridgeScenario {
  scenarioId: string;
  seed: number;
  difficultyLevel: DifficultyLevel;
  originalJourneyKm: number;
  newJourneyMetres: number;
  dailyUsers: number;
  schoolchildren: number;
  farmers: number;
  traders: number;
  peakUsers: number;
  floodRiseMetres: number;
  walkwayRequirementMetres: number;
  scaleMetresPerCm: number;
  allowanceRate: number;
  vehicleCapacityUnits: number;
  labourWorkers: number;
  labourDays: number;
  labourDailyRate: number;
  contingencyRate: number;
  communityBudget: number;
  sites: CrossingSite[];
  designCards: Record<BridgeSystemId, SimulationDesignCard>;
  suppliers: SupplierOption[];
}

export interface DecisionDefinition {
  id: number;
  missionId: MissionId;
  actionTitle: string;
  competencyTags: CompetencyTag[];
  consequenceDomain: ConsequenceDomain;
  branchSpecific?: boolean;
}

export interface DecisionAttempt {
  attemptNumber: number;
  answer: string | number | boolean | null;
  working?: string;
  correct: boolean;
  createdAt: string;
  hintLevelAtAttempt: number;
  misconceptionTag?: MisconceptionTag;
}

export interface DecisionRecord {
  decisionId: number;
  completed: boolean;
  firstStartedAt?: string;
  completedAt?: string;
  hintsUsed: number;
  highestHintLevel: number;
  attempts: DecisionAttempt[];
  originalAnswer?: string | number | boolean | null;
  revisedAnswer?: string | number | boolean | null;
}

export type ProjectOutcome =
  | 'PROJECT APPROVED'
  | 'APPROVED AFTER REDESIGN'
  | 'STRUCTURALLY SUCCESSFUL – OVER BUDGET'
  | 'CONSTRUCTION INCOMPLETE'
  | 'MODIFICATION REQUIRED'
  | 'ENVIRONMENTAL TEST FAILURE'
  | 'LOAD TEST FAILURE'
  | 'PROJECT SUSPENDED';

export interface FootbridgeProjectState {
  version: 1;
  scenario: FootbridgeScenario;
  currentMission: MissionId;
  highestUnlockedMission: MissionId;
  selectedSiteId?: CrossingSite['id'];
  riverSpanStudent?: number;
  floodIdentified?: boolean;
  walkwaySelected?: number;
  selectedBridgeSystem?: BridgeSystemId;
  selectedSupplierId?: string;
  decisionRecords: Record<number, DecisionRecord>;
  notebook: Record<string, string[]>;
  calculatedQuantities: Record<string, number>;
  materialsRequired: Record<string, number>;
  materialsOrdered: Record<string, number>;
  packagesOrdered: Record<string, number>;
  tripsOrdered?: number;
  materialCost?: number;
  transportCost?: number;
  labourCost?: number;
  contingency?: number;
  totalCost?: number;
  materialsDelivered: Record<string, number>;
  constructionComplete: boolean;
  constructionDefects: string[];
  inspectionFindings: string[];
  testingAuthorised: boolean;
  normalTestStatus?: string;
  peakTestStatus?: string;
  environmentTestStatus?: string;
  testHistory: string[];
  diagnosisAttempts: number;
  diagnosisCorrect: boolean;
  diagnosisHistory: string[];
  lastFailureCause?: string;
  redesignCount: number;
  redesignHistory: string[];
  competencyScores: Partial<Record<CompetencyTag, number>>;
  misconceptionTags: MisconceptionTag[];
  finalProjectStatus?: ProjectOutcome;
  createdAt: string;
  updatedAt: string;
}
