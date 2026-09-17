import { FootbridgeProjectState, SupplierOption } from './types';

export function roundTo(value: number, places = 2) {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function selectedSiteSpan(state: FootbridgeProjectState) {
  const site = state.scenario.sites.find((item) => item.id === state.selectedSiteId);
  return site?.spanMetres ?? state.scenario.sites[0].spanMetres;
}

export function learnerDesignSpan(state: FootbridgeProjectState) {
  const measured = state.riverSpanStudent;
  return Number.isFinite(measured) && Number(measured) > 0 ? Number(measured) : selectedSiteSpan(state);
}

export function learnerDesignWidth(state: FootbridgeProjectState) {
  const width = state.walkwaySelected;
  return Number.isFinite(width) && Number(width) > 0 ? Number(width) : state.scenario.walkwayRequirementMetres;
}

export function deckPackageSize(state: FootbridgeProjectState) {
  if (!state.selectedBridgeSystem) return 1;
  const card = state.scenario.designCards[state.selectedBridgeSystem];
  return Math.max(2, Math.ceil(card.primaryPackageSize / 2));
}

export function canonicalProcurementRequirements(state: FootbridgeProjectState) {
  if (!state.selectedBridgeSystem) return null;
  const card = state.scenario.designCards[state.selectedBridgeSystem];
  const span = selectedSiteSpan(state);
  const width = state.scenario.walkwayRequirementMetres;
  const modules = Math.ceil(span / card.moduleLength);
  const primaryUnits = modules * card.memberUnitsPerModule;
  const deckArea = roundTo(span * width, 2);
  const deckUnits = Math.ceil(deckArea / card.deckUnitArea);
  const connections = modules * card.crossMembersPerModule * card.connectionsPerCrossMember * card.fastenersPerConnection;
  const deckAllowanceUnits = Math.ceil(deckUnits * state.scenario.allowanceRate);
  const secondaryBaseUnits = deckArea * card.secondaryResourcePerSquareMetre;
  const secondaryPackages = Math.ceil(secondaryBaseUnits / card.secondaryPackageSize);
  return {
    span,
    width,
    modules,
    primaryUnits,
    deckArea,
    deckUnits,
    connections,
    deckAllowanceUnits,
    deckPurchaseTarget: deckUnits + deckAllowanceUnits,
    primaryPackageSize: card.primaryPackageSize,
    primaryPackages: Math.ceil(primaryUnits / card.primaryPackageSize),
    deckPackageSize: deckPackageSize(state),
    deckPackages: Math.ceil((deckUnits + deckAllowanceUnits) / deckPackageSize(state)),
    secondaryBaseUnits: roundTo(secondaryBaseUnits, 2),
    secondaryPackageSize: card.secondaryPackageSize,
    secondaryPackages,
    secondaryPurchaseUnits: secondaryPackages * card.secondaryPackageSize,
  };
}

export function learnerCalculationTargets(state: FootbridgeProjectState) {
  if (!state.selectedBridgeSystem) return null;
  const card = state.scenario.designCards[state.selectedBridgeSystem];
  const span = learnerDesignSpan(state);
  const width = learnerDesignWidth(state);
  const modules = Math.ceil(span / card.moduleLength);
  const primaryUnits = modules * card.memberUnitsPerModule;
  const deckArea = roundTo(span * width, 2);
  const deckUnits = Math.ceil(deckArea / card.deckUnitArea);
  const connections = modules * card.crossMembersPerModule * card.connectionsPerCrossMember * card.fastenersPerConnection;
  const deckAllowanceUnits = Math.ceil(deckUnits * state.scenario.allowanceRate);
  return { span, width, modules, primaryUnits, deckArea, deckUnits, connections, deckAllowanceUnits };
}

export function plannedPackageRequirements(state: FootbridgeProjectState) {
  if (!state.selectedBridgeSystem) return null;
  const card = state.scenario.designCards[state.selectedBridgeSystem];
  const canonical = learnerCalculationTargets(state);
  if (!canonical) return null;
  const plannedPrimary = state.calculatedQuantities.primaryUnits ?? canonical.primaryUnits;
  const plannedDeck = state.calculatedQuantities.deckUnits ?? canonical.deckUnits;
  const plannedAllowance = state.calculatedQuantities.deckAllowanceUnits ?? canonical.deckAllowanceUnits;
  const primaryPackages = Math.ceil(Math.max(0, plannedPrimary) / card.primaryPackageSize);
  const deckPack = deckPackageSize(state);
  const deckPackages = Math.ceil(Math.max(0, plannedDeck + plannedAllowance) / deckPack);
  return {
    plannedPrimary,
    plannedDeck,
    plannedAllowance,
    primaryPackageSize: card.primaryPackageSize,
    primaryPackages,
    deckPackageSize: deckPack,
    deckPackages,
  };
}

export function selectedSupplier(state: FootbridgeProjectState): SupplierOption {
  return state.scenario.suppliers.find((supplier) => supplier.id === state.selectedSupplierId) ?? state.scenario.suppliers[0];
}

export function orderedMaterialUnits(state: FootbridgeProjectState) {
  return {
    primary: Math.max(0, state.materialsOrdered.primary ?? 0),
    deck: Math.max(0, state.materialsOrdered.deck ?? 0),
    connections: Math.max(0, state.materialsOrdered.connections ?? 0),
    secondary: Math.max(0, state.materialsOrdered.secondary ?? 0),
  };
}

export function materialCostFromOrders(state: FootbridgeProjectState) {
  if (!state.selectedBridgeSystem) return 0;
  const card = state.scenario.designCards[state.selectedBridgeSystem];
  const ordered = orderedMaterialUnits(state);
  return roundTo(
    ordered.primary * card.primaryUnitPrice +
      ordered.deck * card.deckUnitPrice +
      ordered.connections * card.connectionUnitPrice +
      ordered.secondary * card.secondaryUnitPrice,
    2,
  );
}

export function orderedDeliveryUnits(state: FootbridgeProjectState) {
  const ordered = orderedMaterialUnits(state);
  return ordered.primary + ordered.deck + ordered.connections + ordered.secondary;
}

export function tripsRequiredForOrders(state: FootbridgeProjectState) {
  const total = orderedDeliveryUnits(state);
  return total <= 0 ? 0 : Math.ceil(total / state.scenario.vehicleCapacityUnits);
}

export function transportCostForTrips(state: FootbridgeProjectState, trips = state.tripsOrdered ?? 0) {
  return Math.max(0, trips) * selectedSupplier(state).deliveryCostPerTrip;
}

export function correctLabourCost(state: FootbridgeProjectState) {
  return state.scenario.labourWorkers * state.scenario.labourDays * state.scenario.labourDailyRate;
}

export function budgetFromRecordedCosts(state: FootbridgeProjectState) {
  const material = Math.max(0, state.materialCost ?? 0);
  const transport = Math.max(0, state.transportCost ?? 0);
  const labour = Math.max(0, state.labourCost ?? 0);
  const subtotal = material + transport + labour;
  const contingency = roundTo(subtotal * state.scenario.contingencyRate, 2);
  return { material, transport, labour, subtotal, contingency, total: roundTo(subtotal + contingency, 2) };
}

export function actualProjectCostReference(state: FootbridgeProjectState) {
  const material = materialCostFromOrders(state);
  const transport = transportCostForTrips(state);
  const labour = correctLabourCost(state);
  const subtotal = material + transport + labour;
  const contingency = roundTo(subtotal * state.scenario.contingencyRate, 2);
  return { material, transport, labour, subtotal, contingency, total: roundTo(subtotal + contingency, 2) };
}
