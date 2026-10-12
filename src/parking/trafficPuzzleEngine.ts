export type VehicleOrientation = 'horizontal' | 'vertical';

export type ParkingVehicle = {
  id: string;
  name: string;
  row: number;
  col: number;
  length: 2 | 3;
  orientation: VehicleOrientation;
  color: string;
  goal?: boolean;
};

export type ParkingPuzzleState = {
  gridSize: number;
  exitRow: number;
  vehicles: ParkingVehicle[];
  moves: number;
};

export const FIRST_PARKING_LEVEL: ParkingPuzzleState = {
  gridSize: 6,
  exitRow: 2,
  moves: 0,
  vehicles: [
    { id: 'mezzo', name: 'Mezzo car', row: 2, col: 0, length: 2, orientation: 'horizontal', color: '#2563eb', goal: true },
    { id: 'blocker', name: 'School bus', row: 1, col: 2, length: 3, orientation: 'vertical', color: '#f97316' },
    { id: 'green', name: 'Green car', row: 0, col: 0, length: 2, orientation: 'horizontal', color: '#16a34a' },
    { id: 'purple', name: 'Purple car', row: 0, col: 3, length: 2, orientation: 'horizontal', color: '#9333ea' },
    { id: 'taxi', name: 'Yellow taxi', row: 4, col: 0, length: 2, orientation: 'horizontal', color: '#eab308' },
    { id: 'cyan', name: 'Cyan car', row: 3, col: 4, length: 2, orientation: 'vertical', color: '#0891b2' },
    { id: 'red', name: 'Red car', row: 5, col: 3, length: 2, orientation: 'horizontal', color: '#dc2626' },
  ],
};

export function occupiedCells(vehicle: ParkingVehicle) {
  return Array.from({ length: vehicle.length }, (_, offset) => ({
    row: vehicle.row + (vehicle.orientation === 'vertical' ? offset : 0),
    col: vehicle.col + (vehicle.orientation === 'horizontal' ? offset : 0),
  }));
}

export function canMoveVehicle(state: ParkingPuzzleState, vehicleId: string, direction: -1 | 1) {
  const vehicle = state.vehicles.find(item => item.id === vehicleId);
  if (!vehicle) return false;
  const next = {
    row: vehicle.row + (vehicle.orientation === 'vertical' ? direction : 0),
    col: vehicle.col + (vehicle.orientation === 'horizontal' ? direction : 0),
  };
  const nextEndRow = next.row + (vehicle.orientation === 'vertical' ? vehicle.length - 1 : 0);
  const nextEndCol = next.col + (vehicle.orientation === 'horizontal' ? vehicle.length - 1 : 0);
  if (next.row < 0 || next.col < 0 || nextEndRow >= state.gridSize || nextEndCol >= state.gridSize) return false;
  const occupiedByOthers = new Set(
    state.vehicles
      .filter(item => item.id !== vehicleId)
      .flatMap(occupiedCells)
      .map(cell => `${cell.row}:${cell.col}`),
  );
  return !Array.from({ length: vehicle.length }, (_, offset) => ({
    row: next.row + (vehicle.orientation === 'vertical' ? offset : 0),
    col: next.col + (vehicle.orientation === 'horizontal' ? offset : 0),
  })).some(cell => occupiedByOthers.has(`${cell.row}:${cell.col}`));
}

export function moveVehicle(state: ParkingPuzzleState, vehicleId: string, direction: -1 | 1): ParkingPuzzleState {
  if (!canMoveVehicle(state, vehicleId, direction)) return state;
  return {
    ...state,
    moves: state.moves + 1,
    vehicles: state.vehicles.map(vehicle => vehicle.id === vehicleId ? {
      ...vehicle,
      row: vehicle.row + (vehicle.orientation === 'vertical' ? direction : 0),
      col: vehicle.col + (vehicle.orientation === 'horizontal' ? direction : 0),
    } : vehicle),
  };
}

export function isParkingPuzzleSolved(state: ParkingPuzzleState) {
  const goal = state.vehicles.find(vehicle => vehicle.goal);
  return Boolean(goal && goal.row === state.exitRow && goal.col + goal.length === state.gridSize);
}
