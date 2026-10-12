import { useCallback, useMemo, useState } from 'react';
import { canMoveVehicle, createParkingLevel, isParkingPuzzleSolved, moveVehicle, PARKING_LEVELS } from './trafficPuzzleEngine';

export const PARKING_MATH_QUESTIONS = [
  { text: 'There are 24 spaces and 18 are occupied. How many are free?', options: ['4', '6', '8', '12'], answer: 1, skill: 'Subtraction' },
  { text: 'Six rows contain 5 spaces each. How many spaces are there?', options: ['11', '25', '30', '35'], answer: 2, skill: 'Multiplication' },
  { text: 'A parking area is 12 m by 8 m. What is its area?', options: ['20 m²', '40 m²', '80 m²', '96 m²'], answer: 3, skill: 'Area' },
  { text: 'Three out of every four spaces are occupied. What percentage is occupied?', options: ['25%', '50%', '75%', '80%'], answer: 2, skill: 'Percentage' },
  { text: 'A car travels 30 m in 6 seconds. What is its average speed?', options: ['4 m/s', '5 m/s', '6 m/s', '24 m/s'], answer: 1, skill: 'Speed' },
  { text: 'Each sensor costs GH₵45. What is the cost of 4 sensors?', options: ['GH₵49', 'GH₵90', 'GH₵160', 'GH₵180'], answer: 3, skill: 'Money' },
  { text: 'Moving from column 2 to column 5 covers how many spaces?', options: ['2', '3', '5', '7'], answer: 1, skill: 'Coordinates' },
  { text: 'A vehicle waits 2 minutes at each of 3 barriers. What is the total wait?', options: ['5 minutes', '6 minutes', '8 minutes', '9 minutes'], answer: 1, skill: 'Time' },
];

export function useParkingPuzzle() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [state, setState] = useState(() => createParkingLevel(0));
  const [selectedId, setSelectedId] = useState('mezzo');
  const [pendingMove, setPendingMove] = useState<{ vehicleId: string; direction: -1 | 1 }>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const selected = state.vehicles.find(vehicle => vehicle.id === selectedId) ?? state.vehicles[0];
  const question = PARKING_MATH_QUESTIONS[questionIndex % PARKING_MATH_QUESTIONS.length];
  const solved = isParkingPuzzleSolved(state);
  const availableMoves = useMemo(() => ({
    backward: selected ? canMoveVehicle(state, selected.id, -1) : false,
    forward: selected ? canMoveVehicle(state, selected.id, 1) : false,
  }), [selected, state]);

  const selectVehicle = useCallback((vehicleId: string) => {
    setSelectedId(vehicleId); setPendingMove(undefined); setAnswerFeedback('');
  }, []);
  const requestMove = useCallback((direction: -1 | 1) => {
    if (!selected || !canMoveVehicle(state, selected.id, direction) || solved) return;
    setPendingMove({ vehicleId: selected.id, direction }); setAnswerFeedback('');
  }, [selected, solved, state]);
  const answer = useCallback((optionIndex: number) => {
    if (!pendingMove) return;
    if (optionIndex !== question.answer) {
      setAnswerFeedback('Not yet. Recheck the calculation—the vehicle remains in place.'); return;
    }
    setState(current => moveVehicle(current, pendingMove.vehicleId, pendingMove.direction));
    setCorrectAnswers(current => current + 1); setQuestionIndex(current => current + 1);
    setAnswerFeedback('Correct! The vehicle movement has been unlocked.'); setPendingMove(undefined);
  }, [pendingMove, question.answer]);
  const loadLevel = useCallback((nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(PARKING_LEVELS.length - 1, nextIndex));
    setLevelIndex(safeIndex); setState(createParkingLevel(safeIndex)); setSelectedId('mezzo');
    setPendingMove(undefined); setQuestionIndex(0); setAnswerFeedback(''); setCorrectAnswers(0);
  }, []);
  const selectAdjacent = useCallback((direction: -1 | 1) => {
    const current = state.vehicles.findIndex(vehicle => vehicle.id === selectedId);
    const next = (current + direction + state.vehicles.length) % state.vehicles.length;
    selectVehicle(state.vehicles[next].id);
  }, [selectVehicle, selectedId, state.vehicles]);

  return {
    state, levelIndex, levelCount: PARKING_LEVELS.length, selected, selectedId, selectVehicle,
    pendingMove, question, answerFeedback, correctAnswers, solved, availableMoves,
    requestMove, answer, reset: () => loadLevel(levelIndex), loadLevel,
    nextLevel: () => loadLevel(levelIndex + 1), selectAdjacent,
  };
}

export type ParkingPuzzleController = ReturnType<typeof useParkingPuzzle>;
