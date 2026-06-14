import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../equation-builder.css';

type Mode = '2d' | '3d';
type Eq = {
  title: string;
  formula: string;
  fields: string[];
  defaults: number[];
  result: string;
  calc: (v: number[]) => number;
  objects: { name: string; icon: string; scenario: string; effect: string; to?: string }[];
};

const equations: Eq[] = [
  {
    title: 'Linear Equation', formula: 'y = mx + c', fields: ['slope m', 'distance x', 'start c'], defaults: [1, 6, 1], result: 'height/position', calc: ([m, x, c]) => m * x + c,
    objects: [
      { name: 'Bridge', icon: '🌉', scenario: 'A community bridge rises gradually from the river bank to the deck.', effect: 'The answer changes the support height.', to: '/student/project/footbridge-stream' },
      { name: 'Road Ramp', icon: '🛣️', scenario: 'A school road needs a gentle ramp for safe movement.', effect: 'The answer changes the ramp height.' },
      { name: 'Robot Route', icon: '🤖', scenario: 'A robot follows a straight route across a classroom.', effect: 'The answer moves the robot.' },
    ],
  },
  {
    title: 'Area Formula', formula: 'Area = length × width', fields: ['length', 'width'], defaults: [12, 8], result: 'square metres', calc: ([l, w]) => l * w,
    objects: [
      { name: 'Playground', icon: '🛝', scenario: 'A school compound becomes a safe play area.', effect: 'The answer expands the safety mat surface.', to: '/student/project/school-playground-layout' },
      { name: 'Farm Plot', icon: '🌱', scenario: 'A farmer plans crop beds for a school garden.', effect: 'The answer expands the planting area.', to: '/student/project/smart-irrigation-system' },
      { name: 'Football Field', icon: '⚽', scenario: 'A coach marks a training pitch.', effect: 'The answer changes the field size.' },
    ],
  },
  {
    title: 'Speed Formula', formula: 'Speed = distance ÷ time', fields: ['distance', 'time'], defaults: [18, 6], result: 'metres per second', calc: ([d, t]) => (t === 0 ? 0 : d / t),
    objects: [
      { name: 'Ferry', icon: '⛴️', scenario: 'A ferry crosses a river and must arrive safely.', effect: 'The answer controls the ferry speed.', to: '/student/project/ferry-river-crossing' },
      { name: 'Smart Parking Car', icon: '🚗', scenario: 'A car moves from the entrance to an empty slot.', effect: 'The answer controls car movement.', to: '/student/project/smart-car-parking-system' },
      { name: 'Rocket', icon: '🚀', scenario: 'A rocket travels upward during launch.', effect: 'The answer controls launch speed.' },
    ],
  },
  {
    title: 'Water Flow Equation', formula: 'Water amount = flow rate × time', fields: ['flow rate', 'time'], defaults: [10, 8], result: 'litres', calc: ([r, t]) => r * t,
    objects: [
      { name: 'Irrigation System', icon: '💦', scenario: 'A garden needs water through pipes and sprinklers.', effect: 'The answer controls water delivered.', to: '/student/project/smart-irrigation-system' },
      { name: 'Drainage Gutter', icon: '🌧️', scenario: 'A road gutter must carry rainwater away.', effect: 'The answer controls drainage capacity.', to: '/student/project/flood-safe-road-drainage-upgrade' },
      { name: 'Water Tank', icon: '🚰', scenario: 'A tank fills from a pipe over time.', effect: 'The answer fills the tank.' },
    ],
  },
];

export default function EquationBuilderPage() {
  const [eqIndex, setEqIndex] = useState(0);
  const [objectIndex, setObjectIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('2d');
  const [values, setValues] = useState(equations[0].defaults);
  const eq = equations[eqIndex];
  const object = eq.objects[objectIndex];
  const answer = eq.calc(values);
  const size = Math.max(40, Math.min(92, 40 + answer * 1.3));
  const chooseEq = (index: number) => { setEqIndex(index); setObjectIndex(0); setValues(equations[index].defaults); };

  return (
    <main className="equation-builder-page">
      <header className="equation-builder-topbar"><Link to="/student/dashboard" className="equation-back">←</Link><div><h1>Equation Builder</h1><p>Pick an equation, choose what to build, add values and watch maths come alive.</p></div><nav><Link to="/student/dashboard" className="equation-nav-pill">Dashboard</Link><Link to="/" className="equation-logout">Logout</Link></nav></header>
      <section className="equation-builder-workspace">
        <article className="equation-picker-card">
          <h2>{eq.title}</h2><div className="equation-formula-box">{eq.formula}</div>
          <h3>1. Choose the equation</h3><div className="equation-chip-grid">{equations.map((item, i) => <button type="button" className={i === eqIndex ? 'active' : ''} onClick={() => chooseEq(i)} key={item.title}>{item.title}</button>)}</div>
          <h3>2. Choose what it should build</h3><div className="equation-object-grid">{eq.objects.map((item, i) => <button type="button" className={i === objectIndex ? 'active' : ''} onClick={() => setObjectIndex(i)} key={item.name}><span>{item.icon}</span>{item.name}</button>)}</div>
          <h3>3. Insert values</h3><div className="equation-object-grid">{eq.fields.map((field, i) => <button type="button" key={field} className="equation-value-button"><span>{field}</span><input type="number" value={values[i]} onChange={(event) => setValues((current) => current.map((value, index) => index === i ? Number(event.target.value) : value))} /></button>)}</div>
        </article>
        <article className="equation-preview-card"><div className="equation-preview-heading"><div><span>Real-life scenario</span><h2>{object.name}</h2></div><span className="equation-preview-icon">{object.icon}</span></div><p className="equation-meaning">{object.scenario}</p><div className="equation-mode-switch"><button type="button" className={mode === '2d' ? 'active' : ''} onClick={() => setMode('2d')}>2D Mode</button><button type="button" className={mode === '3d' ? 'active' : ''} onClick={() => setMode('3d')}>3D Mode</button></div><div className={`equation-preview-stage ${mode === '3d' ? 'equation-stage-3d' : ''}`}><div className="equation-preview-object" style={{ width: `${size}%`, minHeight: mode === '3d' ? 150 : 90 }}>{object.icon}</div><strong>{answer.toFixed(answer % 1 ? 2 : 0)} {eq.result}</strong><p>{object.effect}</p></div><div className="equation-preview-actions">{object.to ? <Link to={object.to}>Open related mission</Link> : <Link to="/student/missions">Explore missions</Link>}<button type="button">Build Preview</button></div></article>
      </section>
      <section className="equation-map-section"><div className="equation-section-title"><h2>Exact equation to object mapping</h2><p>Equations become practical builder choices.</p></div><div className="equation-map-grid">{equations.map((item) => <article className="equation-map-card" key={item.title}><h3>{item.title}</h3><code>{item.formula}</code><ul>{item.objects.map((build) => <li key={build.name}>{build.icon} {build.name}<em>{build.effect}</em></li>)}</ul></article>)}</div></section>
      <style>{`.equation-value-button{display:grid!important;grid-template-columns:1fr 90px;gap:.5rem}.equation-value-button input{border:0;border-radius:999px;background:#eef6ff;padding:.45rem;text-align:center}.equation-mode-switch{display:flex;gap:.7rem;margin:1rem 0}.equation-mode-switch button{border:0;border-radius:999px;padding:.65rem 1rem;font-weight:900}.equation-mode-switch button.active{background:linear-gradient(135deg,#2563eb,#a21caf);color:white}.equation-stage-3d{perspective:700px}.equation-stage-3d .equation-preview-object{transform:rotateX(55deg) rotateZ(-12deg)}`}</style>
    </main>
  );
}
