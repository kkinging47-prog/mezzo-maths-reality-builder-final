import { useMemo, useState } from 'react';
import {
  canMoveVehicle,
  FIRST_PARKING_LEVEL,
  isParkingPuzzleSolved,
  moveVehicle,
  ParkingPuzzleState,
} from '../parking/trafficPuzzleEngine';

const MOVE_QUESTIONS = [
  { text: 'There are 24 spaces and 18 are occupied. How many are free?', options: ['4', '6', '8', '12'], answer: 1, skill: 'Subtraction' },
  { text: 'Six rows contain 5 spaces each. How many spaces are there?', options: ['11', '25', '30', '35'], answer: 2, skill: 'Multiplication' },
  { text: 'A parking area is 12 m by 8 m. What is its area?', options: ['20 m²', '40 m²', '80 m²', '96 m²'], answer: 3, skill: 'Area' },
  { text: 'Three out of every four spaces are occupied. What percentage is occupied?', options: ['25%', '50%', '75%', '80%'], answer: 2, skill: 'Percentage' },
  { text: 'A car travels 30 m in 6 seconds. What is its average speed?', options: ['4 m/s', '5 m/s', '6 m/s', '24 m/s'], answer: 1, skill: 'Speed' },
  { text: 'Each sensor costs GH₵45. What is the cost of 4 sensors?', options: ['GH₵49', 'GH₵90', 'GH₵160', 'GH₵180'], answer: 3, skill: 'Money' },
  { text: 'On a grid, moving from column 2 to column 5 is how many spaces?', options: ['2', '3', '5', '7'], answer: 1, skill: 'Coordinates' },
  { text: 'A vehicle waits 2 minutes at each of 3 barriers. What is the total wait?', options: ['5 minutes', '6 minutes', '8 minutes', '9 minutes'], answer: 1, skill: 'Time' },
];

type PendingMove = { vehicleId: string; direction: -1 | 1 };

export default function SmartParkingTrafficPuzzle2D() {
  const [state, setState] = useState<ParkingPuzzleState>(() => structuredClone(FIRST_PARKING_LEVEL));
  const [selectedId, setSelectedId] = useState('mezzo');
  const [pendingMove, setPendingMove] = useState<PendingMove>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState('');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const solved = isParkingPuzzleSolved(state);
  const selected = state.vehicles.find(vehicle => vehicle.id === selectedId);
  const question = MOVE_QUESTIONS[questionIndex % MOVE_QUESTIONS.length];
  const availableMoves = useMemo(() => selected ? {
    backward: canMoveVehicle(state, selected.id, -1),
    forward: canMoveVehicle(state, selected.id, 1),
  } : { backward: false, forward: false }, [selected, state]);

  function requestMove(direction: -1 | 1) {
    if (!selected || !canMoveVehicle(state, selected.id, direction) || solved) return;
    setPendingMove({ vehicleId: selected.id, direction });
    setAnswerFeedback('');
  }

  function answer(optionIndex: number) {
    if (!pendingMove) return;
    if (optionIndex !== question.answer) {
      setAnswerFeedback('Not yet. Recheck the calculation—the vehicle remains in place.');
      return;
    }
    setState(current => moveVehicle(current, pendingMove.vehicleId, pendingMove.direction));
    setCorrectAnswers(current => current + 1);
    setQuestionIndex(current => current + 1);
    setAnswerFeedback('Correct! The vehicle movement has been unlocked.');
    setPendingMove(undefined);
  }

  function reset() {
    setState(structuredClone(FIRST_PARKING_LEVEL));
    setSelectedId('mezzo');
    setPendingMove(undefined);
    setQuestionIndex(0);
    setAnswerFeedback('');
    setCorrectAnswers(0);
  }

  return <section className="traffic-puzzle" aria-label="Mezzo smart parking traffic puzzle">
    <header className="traffic-puzzle__header">
      <div><span>PLAYABLE 2D PROTOTYPE · LEVEL 1</span><h3>Clear the Mezzo Car</h3><p>Select vehicles, solve the maths challenge and move the blue Mezzo car safely to the exit.</p></div>
      <div className="traffic-puzzle__stats"><strong>{state.moves}</strong><span>moves</span><strong>{correctAnswers}</strong><span>maths unlocked</span></div>
    </header>

    <div className="traffic-puzzle__layout">
      <div className="traffic-puzzle__board-wrap">
        <div className="traffic-puzzle__board" style={{ '--grid-size': state.gridSize } as React.CSSProperties}>
          {Array.from({ length: state.gridSize * state.gridSize }, (_, index) => <i key={index} />)}
          <div className="traffic-puzzle__exit" style={{ gridRow: state.exitRow + 1 }}>EXIT</div>
          {state.vehicles.map(vehicle => <button
            key={vehicle.id}
            type="button"
            aria-label={`${vehicle.name}, ${vehicle.orientation}`}
            aria-pressed={selectedId === vehicle.id}
            className={`traffic-vehicle ${vehicle.goal ? 'goal' : ''} ${selectedId === vehicle.id ? 'selected' : ''}`}
            onClick={() => setSelectedId(vehicle.id)}
            style={{
              '--vehicle-color': vehicle.color,
              gridColumn: `${vehicle.col + 1} / span ${vehicle.orientation === 'horizontal' ? vehicle.length : 1}`,
              gridRow: `${vehicle.row + 1} / span ${vehicle.orientation === 'vertical' ? vehicle.length : 1}`,
            } as React.CSSProperties}
          ><span>{vehicle.orientation === 'horizontal' ? '🚗' : '🚙'}</span><small>{vehicle.goal ? 'MEZZO' : vehicle.name}</small></button>)}
        </div>
        <p className="traffic-puzzle__selected">Selected: <strong>{selected?.name}</strong> · moves {selected?.orientation === 'horizontal' ? 'left or right' : 'up or down'}</p>
      </div>

      <aside className="traffic-puzzle__panel">
        {solved ? <div className="traffic-puzzle__success"><span>🏆</span><h4>Traffic cleared!</h4><p>You used mathematics and spatial reasoning to guide the Mezzo car safely out in {state.moves} moves.</p><button type="button" onClick={reset}>Play again</button></div> : <>
          <div className="traffic-puzzle__move-buttons">
            <button type="button" disabled={!availableMoves.backward} onClick={() => requestMove(-1)}>{selected?.orientation === 'horizontal' ? '← Move left' : '↑ Move up'}</button>
            <button type="button" disabled={!availableMoves.forward} onClick={() => requestMove(1)}>{selected?.orientation === 'horizontal' ? 'Move right →' : 'Move down ↓'}</button>
          </div>
          <p className="traffic-puzzle__tip">Hint: move the orange school bus downward twice, then move the blue Mezzo car towards the exit.</p>
          {pendingMove && <div className="traffic-puzzle__question">
            <span>{question.skill} · answer correctly to unlock this move</span>
            <h4>{question.text}</h4>
            <div>{question.options.map((option, index) => <button key={option} type="button" onClick={() => answer(index)}>{option}</button>)}</div>
          </div>}
          {answerFeedback && <p className={`traffic-puzzle__feedback ${answerFeedback.startsWith('Correct') ? 'correct' : 'wrong'}`}>{answerFeedback}</p>}
          <button className="traffic-puzzle__reset" type="button" onClick={reset}>Reset level</button>
        </>}
      </aside>
    </div>

    <style>{`
      .traffic-puzzle{margin-top:1.1rem;padding:1rem;border:2px solid #bfdbfe;border-radius:24px;background:linear-gradient(135deg,#eff6ff,#ecfeff);color:#0f172a}.traffic-puzzle__header{display:flex;justify-content:space-between;gap:1rem;align-items:start;margin-bottom:1rem}.traffic-puzzle__header span{color:#1d4ed8;font-size:.72rem;font-weight:950;letter-spacing:.08em}.traffic-puzzle__header h3{margin:.2rem 0;font-size:clamp(1.3rem,2vw,1.85rem)}.traffic-puzzle__header p{margin:0;color:#475569;font-weight:700}.traffic-puzzle__stats{display:grid;grid-template-columns:auto auto;gap:.1rem .45rem;align-items:center;padding:.65rem .8rem;border-radius:15px;background:#fff;border:1px solid #dbeafe}.traffic-puzzle__stats strong{font-size:1.2rem;color:#1d4ed8}.traffic-puzzle__stats span{font-size:.72rem;color:#64748b}.traffic-puzzle__layout{display:grid;grid-template-columns:minmax(300px,1.25fr) minmax(260px,.75fr);gap:1rem}.traffic-puzzle__board-wrap{min-width:0}.traffic-puzzle__board{--grid-size:6;position:relative;display:grid;grid-template-columns:repeat(var(--grid-size),1fr);grid-template-rows:repeat(var(--grid-size),1fr);gap:5px;aspect-ratio:1;max-width:620px;margin:auto;padding:10px;border:10px solid #334155;border-right-width:3px;border-radius:18px;background:#64748b;box-shadow:0 18px 36px rgba(15,23,42,.2)}.traffic-puzzle__board>i{grid-column:auto;grid-row:auto;border-radius:7px;background:#475569;border:1px solid rgba(255,255,255,.1)}.traffic-puzzle__exit{position:absolute;right:-58px;width:58px;height:calc((100% - 20px - 25px)/6);display:grid;place-items:center;align-self:center;background:#22c55e;color:#052e16;font-size:.67rem;font-weight:950;border-radius:0 10px 10px 0}.traffic-vehicle{z-index:2;margin:3px;border:3px solid rgba(15,23,42,.55);border-radius:14px;background:var(--vehicle-color);box-shadow:inset 0 3px 0 rgba(255,255,255,.35),0 5px 10px rgba(15,23,42,.3);color:#fff;display:grid;place-items:center;align-content:center;gap:0;cursor:pointer;min-width:0;transition:transform .15s,outline .15s}.traffic-vehicle:hover{transform:scale(1.025)}.traffic-vehicle.selected{outline:4px solid #facc15;outline-offset:1px}.traffic-vehicle.goal{border-color:#dbeafe}.traffic-vehicle span{font-size:clamp(1.25rem,4vw,2.4rem);line-height:1}.traffic-vehicle small{font-size:clamp(.48rem,1vw,.7rem);font-weight:950;text-shadow:0 1px 2px #000}.traffic-puzzle__selected{text-align:center;color:#475569}.traffic-puzzle__panel{display:grid;align-content:start;gap:.8rem;padding:1rem;border-radius:18px;background:#fff;border:1px solid #dbeafe}.traffic-puzzle__move-buttons{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}.traffic-puzzle__move-buttons button,.traffic-puzzle__question button,.traffic-puzzle__success button{border:0;border-radius:12px;padding:.75rem;background:#1d4ed8;color:#fff;font-weight:900;cursor:pointer}.traffic-puzzle__move-buttons button:disabled{background:#cbd5e1;color:#64748b;cursor:not-allowed}.traffic-puzzle__tip{margin:0;padding:.7rem;border-radius:12px;background:#fef9c3;color:#713f12;font-size:.82rem;font-weight:800}.traffic-puzzle__question{padding:.8rem;border-radius:14px;background:#eff6ff;border:2px solid #93c5fd}.traffic-puzzle__question>span{font-size:.68rem;color:#1d4ed8;font-weight:950;text-transform:uppercase}.traffic-puzzle__question h4{margin:.35rem 0 .7rem;line-height:1.35}.traffic-puzzle__question>div{display:grid;grid-template-columns:1fr 1fr;gap:.45rem}.traffic-puzzle__question button{background:#fff;color:#1e3a8a;border:2px solid #bfdbfe}.traffic-puzzle__question button:hover{border-color:#2563eb}.traffic-puzzle__feedback{margin:0;padding:.7rem;border-radius:11px;font-weight:900}.traffic-puzzle__feedback.correct{background:#dcfce7;color:#166534}.traffic-puzzle__feedback.wrong{background:#fee2e2;color:#991b1b}.traffic-puzzle__reset{justify-self:start;border:1px solid #cbd5e1;border-radius:10px;padding:.55rem .75rem;background:#f8fafc;color:#334155;font-weight:800;cursor:pointer}.traffic-puzzle__success{text-align:center;padding:1rem;border-radius:15px;background:#f0fdf4;border:2px solid #86efac}.traffic-puzzle__success>span{font-size:3rem}.traffic-puzzle__success h4{font-size:1.35rem;margin:.4rem 0;color:#166534}.traffic-puzzle__success p{color:#365e42;line-height:1.5}.traffic-puzzle__success button{background:#15803d}@media(max-width:820px){.traffic-puzzle__header{display:grid}.traffic-puzzle__stats{justify-self:start}.traffic-puzzle__layout{grid-template-columns:1fr}.traffic-puzzle__board{max-width:520px}.traffic-puzzle__exit{right:-45px;width:45px}.traffic-puzzle__panel{margin-top:.5rem}}@media(max-width:440px){.traffic-puzzle{padding:.65rem}.traffic-puzzle__board{gap:3px;padding:6px;border-width:6px;border-right-width:2px}.traffic-puzzle__exit{right:-36px;width:36px;font-size:.52rem}.traffic-vehicle{margin:1px;border-width:2px;border-radius:8px}.traffic-puzzle__question>div{grid-template-columns:1fr}}
    `}</style>
  </section>;
}
