import { BridgeSystemId, DifficultyLevel, FootbridgeScenario, SimulationDesignCard } from './types';

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function between(rng: () => number, min: number, max: number, step = 1) {
  const count = Math.floor((max - min) / step);
  return round(min + Math.floor(rng() * (count + 1)) * step, 3);
}

function integer(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function priced(base: number, rng: () => number) {
  return Math.max(1, Math.round(base * between(rng, 0.88, 1.14, 0.01)));
}

function makeDesignCards(rng: () => number): Record<BridgeSystemId, SimulationDesignCard> {
  return {
    timber: {
      id: 'timber',
      name: 'Timber Bridge System',
      summary: 'A fictional modular system using virtual timber members, deck boards and connection tokens.',
      relativeCost: 2,
      transportDifficulty: 2,
      maintenanceLevel: 3,
      constructionTime: 2,
      availability: integer(rng, 3, 5),
      environmentalSuitability: integer(rng, 2, 4),
      simulationDurability: 3,
      moduleLength: 2,
      deckUnitArea: 0.6,
      memberUnitsPerModule: 4,
      crossMembersPerModule: 2,
      connectionsPerCrossMember: 4,
      fastenersPerConnection: 2,
      primaryPackageSize: 10,
      secondaryResourcePerSquareMetre: 0.45,
      secondaryPackageSize: 5,
      primaryUnitPrice: priced(42, rng),
      deckUnitPrice: priced(18, rng),
      connectionUnitPrice: priced(3, rng),
      secondaryUnitPrice: priced(24, rng),
    },
    steel: {
      id: 'steel',
      name: 'Steel Bridge System',
      summary: 'A fictional modular system using virtual steel members, deck panels and connection tokens.',
      relativeCost: 4,
      transportDifficulty: 4,
      maintenanceLevel: 2,
      constructionTime: 3,
      availability: integer(rng, 2, 5),
      environmentalSuitability: integer(rng, 3, 5),
      simulationDurability: 5,
      moduleLength: 2.5,
      deckUnitArea: 0.75,
      memberUnitsPerModule: 3,
      crossMembersPerModule: 2,
      connectionsPerCrossMember: 4,
      fastenersPerConnection: 3,
      primaryPackageSize: 8,
      secondaryResourcePerSquareMetre: 0.32,
      secondaryPackageSize: 4,
      primaryUnitPrice: priced(68, rng),
      deckUnitPrice: priced(31, rng),
      connectionUnitPrice: priced(4, rng),
      secondaryUnitPrice: priced(29, rng),
    },
    'reinforced-concrete': {
      id: 'reinforced-concrete',
      name: 'Reinforced-Concrete Bridge System',
      summary: 'A fictional simulation system using virtual deck units, support components and Mezzo mix-card resources.',
      relativeCost: 3,
      transportDifficulty: 5,
      maintenanceLevel: 1,
      constructionTime: 5,
      availability: integer(rng, 2, 5),
      environmentalSuitability: integer(rng, 3, 5),
      simulationDurability: 5,
      moduleLength: 2,
      deckUnitArea: 0.8,
      memberUnitsPerModule: 3,
      crossMembersPerModule: 2,
      connectionsPerCrossMember: 3,
      fastenersPerConnection: 2,
      primaryPackageSize: 6,
      secondaryResourcePerSquareMetre: 0.55,
      secondaryPackageSize: 6,
      primaryUnitPrice: priced(57, rng),
      deckUnitPrice: priced(27, rng),
      connectionUnitPrice: priced(4, rng),
      secondaryUnitPrice: priced(20, rng),
    },
  };
}

export function deriveBranchBaselineCost(scenario: FootbridgeScenario, systemId: BridgeSystemId, spanMetres: number) {
  const card = scenario.designCards[systemId];
  const modules = Math.ceil(spanMetres / card.moduleLength);
  const deckArea = spanMetres * scenario.walkwayRequirementMetres;
  const primaryUnits = modules * card.memberUnitsPerModule;
  const deckUnits = Math.ceil(deckArea / card.deckUnitArea);
  const connections = modules * card.crossMembersPerModule * card.connectionsPerCrossMember * card.fastenersPerConnection;
  const secondary = Math.ceil((deckArea * card.secondaryResourcePerSquareMetre) / card.secondaryPackageSize) * card.secondaryPackageSize;
  const allowanceMultiplier = 1 + scenario.allowanceRate;
  const primaryWithAllowance = Math.ceil(primaryUnits * allowanceMultiplier);
  const deckWithAllowance = Math.ceil(deckUnits * allowanceMultiplier);
  const materialCost =
    primaryWithAllowance * card.primaryUnitPrice +
    deckWithAllowance * card.deckUnitPrice +
    connections * card.connectionUnitPrice +
    secondary * card.secondaryUnitPrice;
  const transportUnits = primaryWithAllowance + deckWithAllowance + connections + secondary;
  const trips = Math.ceil(transportUnits / scenario.vehicleCapacityUnits);
  const transportCost = trips * scenario.suppliers[0].deliveryCostPerTrip;
  const labourCost = scenario.labourWorkers * scenario.labourDays * scenario.labourDailyRate;
  const subtotal = materialCost + transportCost + labourCost;
  return Math.ceil(subtotal * (1 + scenario.contingencyRate));
}

export function validateScenario(scenario: FootbridgeScenario) {
  const problems: string[] = [];
  const numericValues = [
    scenario.originalJourneyKm,
    scenario.newJourneyMetres,
    scenario.dailyUsers,
    scenario.peakUsers,
    scenario.floodRiseMetres,
    scenario.walkwayRequirementMetres,
    scenario.scaleMetresPerCm,
    scenario.vehicleCapacityUnits,
    scenario.communityBudget,
  ];
  if (numericValues.some((value) => !Number.isFinite(value) || value <= 0)) problems.push('Scenario contains a missing or invalid positive number.');
  if (scenario.newJourneyMetres >= scenario.originalJourneyKm * 1000) problems.push('New journey must be shorter than the existing journey.');
  if (scenario.sites.length !== 3) problems.push('Exactly three crossing sites are required.');
  if (scenario.sites.some((site) => site.spanMetres < 14 || site.spanMetres > 22)) problems.push('A site span is outside the controlled simulation range.');
  if (scenario.peakUsers > scenario.dailyUsers) problems.push('Peak simultaneous users cannot exceed daily users.');

  (Object.keys(scenario.designCards) as BridgeSystemId[]).forEach((systemId) => {
    const card = scenario.designCards[systemId];
    if (card.moduleLength <= 0 || card.deckUnitArea <= 0 || card.primaryPackageSize <= 0 || card.secondaryPackageSize <= 0) {
      problems.push(`${systemId} contains a division-by-zero risk.`);
    }
    scenario.sites.forEach((site) => {
      const cost = deriveBranchBaselineCost(scenario, systemId, site.spanMetres);
      if (!Number.isFinite(cost) || cost <= 0) problems.push(`${systemId} has an invalid derived project cost.`);
      if (cost > scenario.communityBudget) problems.push(`${systemId} cannot be completed within the intended scenario budget.`);
    });
  });

  return { valid: problems.length === 0, problems };
}

export function generateFootbridgeScenario(seed: number, difficultyLevel: DifficultyLevel = 2): FootbridgeScenario {
  const safeSeed = (seed >>> 0) || 1;
  const rng = mulberry32(safeSeed);
  const designCards = makeDesignCards(rng);
  const originalJourneyKm = between(rng, 1.8, 3.2, 0.1);
  const maxNewMetres = Math.min(850, Math.floor(originalJourneyKm * 1000 - 550));
  const newJourneyMetres = between(rng, 350, Math.max(350, maxNewMetres), 25);
  const dailyUsers = integer(rng, 120, 280);
  const schoolchildren = integer(rng, 35, Math.floor(dailyUsers * 0.45));
  const farmers = integer(rng, 20, Math.floor(dailyUsers * 0.3));
  const traders = integer(rng, 18, Math.floor(dailyUsers * 0.28));
  const baseSpan = between(rng, 15, 20.5, 0.5);
  const siteSpans = [
    Math.max(14, round(baseSpan - between(rng, 0, 1.5, 0.5), 1)),
    Math.min(22, round(baseSpan + between(rng, 0, 1.5, 0.5), 1)),
    Math.min(22, Math.max(14, round(baseSpan + between(rng, -1, 2, 0.5), 1))),
  ];
  const sites = siteSpans.map((spanMetres, index) => ({
    id: (['site-a', 'site-b', 'site-c'] as const)[index],
    name: ['School Path Crossing', 'Market Bend Crossing', 'Farm Track Crossing'][index],
    spanMetres,
    accessRating: integer(rng, 2, 5),
    environmentalRating: integer(rng, 2, 5),
    convenienceRating: integer(rng, 2, 5),
    costFactor: between(rng, 0.9, 1.15, 0.05),
    narrative: [
      'Close to the school path, but the banks become muddy after heavy rain.',
      'Convenient for traders and residents, with moderate bank access.',
      'Good farm access, but farther from the main residential footpath.',
    ][index],
  }));

  const partial: FootbridgeScenario = {
    scenarioId: `FB-${safeSeed.toString(36).toUpperCase()}`,
    seed: safeSeed,
    difficultyLevel,
    originalJourneyKm,
    newJourneyMetres,
    dailyUsers,
    schoolchildren,
    farmers,
    traders,
    peakUsers: integer(rng, 12, 28),
    floodRiseMetres: between(rng, 0.8, 1.8, 0.1),
    walkwayRequirementMetres: between(rng, 1.2, 1.8, 0.1),
    scaleMetresPerCm: [1, 2, 2.5][integer(rng, 0, 2)],
    allowanceRate: between(rng, 0.08, 0.12, 0.01),
    vehicleCapacityUnits: integer(rng, 150, 230),
    labourWorkers: integer(rng, 4, 8),
    labourDays: integer(rng, 5, 10),
    labourDailyRate: integer(rng, 85, 145),
    contingencyRate: between(rng, 0.05, 0.1, 0.01),
    communityBudget: 1,
    sites,
    designCards,
    suppliers: [
      { id: 'supplier-a', name: 'Nkabom Materials Depot', unitPrice: priced(12, rng), packageSize: 10, deliveryCostPerTrip: priced(125, rng), availabilityRating: integer(rng, 3, 5) },
      { id: 'supplier-b', name: 'Adom Community Supply', unitPrice: priced(11, rng), packageSize: 12, deliveryCostPerTrip: priced(145, rng), availabilityRating: integer(rng, 2, 5) },
    ],
  };

  let highestBaseline = 0;
  (Object.keys(designCards) as BridgeSystemId[]).forEach((systemId) => {
    sites.forEach((site) => {
      highestBaseline = Math.max(highestBaseline, deriveBranchBaselineCost(partial, systemId, site.spanMetres));
    });
  });
  partial.communityBudget = Math.ceil(highestBaseline * between(rng, 1.08, 1.2, 0.01) / 100) * 100;

  const validation = validateScenario(partial);
  if (!validation.valid) {
    throw new Error(`Footbridge scenario ${partial.scenarioId} failed validation: ${validation.problems.join(' ')}`);
  }
  return partial;
}

export function distanceSavedMetres(scenario: FootbridgeScenario) {
  return round(scenario.originalJourneyKm * 1000 - scenario.newJourneyMetres, 1);
}

export function journeyReductionPercent(scenario: FootbridgeScenario) {
  return round((distanceSavedMetres(scenario) / (scenario.originalJourneyKm * 1000)) * 100, 1);
}
