import { useMemo, useState } from 'react';

type Question = { question: string; options: [string, string, string, string]; correct: number };

const QUESTIONS: Question[] = [
  { question: 'What problem should the footbridge solve?', options: ['A longer market building', 'The long detour between Adom and Nkabom', 'A shortage of football fields', 'A lack of parking spaces'], correct: 1 },
  { question: 'Which figure is most useful when checking the busiest bridge load?', options: ['The number of houses', 'The daily rainfall', 'The peak number of users together', 'The number of market stalls'], correct: 2 },
  { question: 'A journey falls from 3,000 m to 800 m. How many metres are saved?', options: ['2,200 m', '3,800 m', '1,200 m', '2,800 m'], correct: 0 },
  { question: 'What calculation finds percentage journey reduction?', options: ['Saving + original × 100', 'Original ÷ saving', 'Saving ÷ original × 100', 'Original − saving ÷ 10'], correct: 2 },
  { question: 'Which crossing place is normally the best choice?', options: ['The widest place', 'The place with the best balance of span, access, safety and environment', 'The place furthest from both communities', 'The deepest place'], correct: 1 },
  { question: 'Which tool is suitable for measuring the river span in the simulation?', options: ['Measuring tape or range markers', 'Thermometer', 'Stopwatch only', 'Weighing scale'], correct: 0 },
  { question: 'Why must the walkway width be checked?', options: ['To change the river colour', 'To ensure users can cross safely', 'To increase the journey distance', 'To reduce the number of supports'], correct: 1 },
  { question: 'Which evidence shows possible seasonal flood risk?', options: ['Paint colour', 'High-water marks on the bank', 'The number of trees', 'The school timetable'], correct: 1 },
  { question: 'At a scale of 1 cm : 2 m, how long represents 20 m?', options: ['5 cm', '10 cm', '20 cm', '40 cm'], correct: 1 },
  { question: 'What should guide the choice of bridge type?', options: ['Appearance only', 'Material colour only', 'Site needs, strength, cost and maintenance', 'The shortest bridge name'], correct: 2 },
  { question: 'Why should the design drawing be read before ordering?', options: ['It identifies required dimensions and components', 'It changes the weather', 'It replaces all calculations', 'It removes the need for inspection'], correct: 0 },
  { question: 'A 24 m span uses 3 m modules. How many modules are required?', options: ['6', '8', '12', '72'], correct: 1 },
  { question: 'If each of 8 modules needs 2 primary members, how many are needed?', options: ['4', '10', '16', '24'], correct: 2 },
  { question: 'What is the area of a 24 m by 2 m bridge deck?', options: ['12 m²', '26 m²', '48 m²', '96 m²'], correct: 2 },
  { question: 'A deck needs 48 m² of covering. Each pack covers 6 m². How many packs?', options: ['6', '8', '42', '54'], correct: 1 },
  { question: 'Eight modules need 6 connections each. How many connections are required?', options: ['14', '42', '48', '64'], correct: 2 },
  { question: 'What is a 10% allowance on 80 timber pieces?', options: ['4', '8', '10', '88'], correct: 1 },
  { question: 'Why are material packages rounded up?', options: ['A fraction of a sealed package cannot be purchased', 'To make the answer smaller', 'To avoid recording cost', 'To remove spare material'], correct: 0 },
  { question: 'Which measurement is used when calculating concrete volume?', options: ['Length × width × depth', 'Length + width only', 'Mass ÷ time', 'Perimeter × colour'], correct: 0 },
  { question: 'How is total procurement cost calculated?', options: ['Add the costs of all required materials', 'Use only the cheapest item', 'Divide every price by zero', 'Ignore package quantities'], correct: 0 },
  { question: 'A truck carries 20 units and 75 units must be moved. How many trips?', options: ['3', '3.75', '4', '5'], correct: 2 },
  { question: 'Four trips cost GH₵250 each. What is the transport cost?', options: ['GH₵62.50', 'GH₵254', 'GH₵750', 'GH₵1,000'], correct: 3 },
  { question: 'Five workers earn GH₵120 per day for 3 days. What is the labour cost?', options: ['GH₵360', 'GH₵600', 'GH₵1,800', 'GH₵2,000'], correct: 2 },
  { question: 'What should a complete project budget include?', options: ['Materials only', 'Transport only', 'Materials, transport, labour and contingency', 'Decoration only'], correct: 2 },
  { question: 'What should happen when delivered materials are fewer than required?', options: ['Hide the shortage', 'Record the shortage and correct it', 'Begin testing immediately', 'Increase the displayed score'], correct: 1 },
  { question: 'When should testing be authorised?', options: ['Before materials arrive', 'After inspection confirms the bridge is ready', 'Before calculations', 'Whenever the bridge looks colourful'], correct: 1 },
  { question: 'What is checked during the normal-use test?', options: ['Ordinary pedestrian loading', 'The final report spelling', 'Only the river colour', 'The market opening time'], correct: 0 },
  { question: 'What is checked during the peak-use test?', options: ['The fewest possible users', 'The expected maximum group of users', 'Only one empty trolley', 'No load at all'], correct: 1 },
  { question: 'What should the environmental test include?', options: ['Rain and seasonal river rise', 'Only bright sunlight', 'Changing the bridge name', 'Removing the foundations'], correct: 0 },
  { question: 'What should the final report contain?', options: ['Only the learner name', 'Decisions, calculations, test results and lessons learned', 'Only the bridge colour', 'An empty page'], correct: 1 },
];

export default function FootbridgeThirtyQuestionPreview({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];
  const selected = answers[index];
  const score = useMemo(() => QUESTIONS.reduce((total, item, i) => total + (answers[i] === item.correct ? 1 : 0), 0), [answers]);
  const outcome = score >= 24 ? 'pass' : score >= 15 ? 'repair' : 'fail';

  function choose(optionIndex: number) {
    setAnswers(current => ({ ...current, [index]: optionIndex }));
    setOpen(false);
  }

  function continueFlow() {
    if (selected === undefined) return;
    if (index === QUESTIONS.length - 1) setFinished(true);
    else { setIndex(current => current + 1); setOpen(false); }
  }

  if (finished) return <section className={`question-preview-result ${outcome}`}>
    <span className="preview-label">TEMPORARY 30-QUESTION TEST RESULT</span>
    <h2>{outcome === 'pass' ? '🎉 Bridge Test Passed!' : outcome === 'repair' ? '🛠️ Bridge Needs Repair' : '⚠️ Bridge Test Failed'}</h2>
    <div className="preview-score"><strong>{score}/30</strong><span>{Math.round(score / 30 * 100)}% correct</span></div>
    <div className={`preview-bridge ${outcome}`} aria-label={`Bridge outcome: ${outcome}`}><i/><i/><i/><i/><i/><i/></div>
    <p>{outcome === 'pass' ? 'Your decisions produced a stable bridge connecting Adom and Nkabom.' : outcome === 'repair' ? 'The bridge is standing, but weak areas must be corrected before the communities can use it.' : 'Too many incorrect project decisions made the bridge unsafe. Recalculate and rebuild before testing again.'}</p>
    <div className="preview-actions"><button className="btn btn-primary" type="button" onClick={() => { setAnswers({}); setIndex(0); setFinished(false); }}>Try again</button><button className="btn btn-ghost" type="button" onClick={onClose}>Return to the full project</button></div>
  </section>;

  return <section className="question-preview-mode">
    <div className="preview-heading"><div><span className="preview-label">TEMPORARY OUTPUT PREVIEW</span><h2>Footbridge Question Test</h2><p>Select from four answers and continue through all 30 questions.</p></div><button className="preview-close" type="button" onClick={onClose}>Close preview</button></div>
    <div className="preview-progress"><div><i style={{ width: `${((index + 1) / 30) * 100}%` }}/></div><strong>Question {index + 1} of 30</strong></div>
    <article className="preview-question-card">
      <span>PROJECT ACTION {index + 1}</span>
      <h3>{question.question}</h3>
      <div className={`answer-dropdown ${open ? 'open' : ''}`}>
        <button type="button" className="answer-dropdown-trigger" onClick={() => setOpen(value => !value)} aria-expanded={open}>
          {selected === undefined ? 'Select an answer' : question.options[selected]} <b>⌄</b>
        </button>
        {open && <div className="answer-dropdown-menu" role="listbox">
          {question.options.map((option, optionIndex) => <button key={option} type="button" role="option" aria-selected={selected === optionIndex} className={optionIndex === question.correct ? 'correct-option' : 'wrong-option'} onClick={() => choose(optionIndex)}><span>{optionIndex === question.correct ? '✓' : '×'}</span>{option}</button>)}
        </div>}
      </div>
      {selected !== undefined && <p className={`preview-feedback ${selected === question.correct ? 'correct' : 'wrong'}`}>{selected === question.correct ? '✓ Correct answer selected.' : `× That option is incorrect. The correct answer is: ${question.options[question.correct]}`}</p>}
    </article>
    <div className="preview-actions"><button className="btn btn-ghost" type="button" disabled={index === 0} onClick={() => { setIndex(current => current - 1); setOpen(false); }}>Previous</button><button className="btn btn-primary" type="button" disabled={selected === undefined} onClick={continueFlow}>{index === 29 ? 'Finish and test bridge' : 'Continue'}</button></div>
  </section>;
}
