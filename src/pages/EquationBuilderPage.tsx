import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../equation-builder.css';

type Mode = '2d' | '3d';
type BuildObject = { name: string; icon: string; scenario: string; effect: string; color: string; to?: string };
type Eq = { title: string; formula: string; fields: string[]; defaults: number[]; result: string; calc: (v: number[]) => number; guide: string; objects: BuildObject[] };

const equations: Eq[] = [
  { title: 'Linear Equation', formula: 'y = mx + c', fields: ['slope m','distance x','start c'], defaults: [1,6,1], result: 'metres', calc: ([m,x,c]) => m*x+c, guide: 'Best for ramps, slopes, routes and straight-line growth.', objects: [
    { name: 'Bridge ramp', icon: '🌉', scenario: 'A footbridge ramp rises from the stream bank to the walking deck.', effect: 'The answer changes the bridge approach height.', color: '#2563eb', to: '/student/project/footbridge-stream' },
    { name: 'Road ramp', icon: '🛣️', scenario: 'A school road needs a gentle rise for safe access.', effect: 'The answer changes the road angle.', color: '#7c3aed' },
    { name: 'Robot route', icon: '🤖', scenario: 'A robot follows a straight classroom path.', effect: 'The answer moves the robot to its final point.', color: '#06b6d4' }
  ]},
  { title: 'Area Formula', formula: 'Area = length × width', fields: ['length','width'], defaults: [12,8], result: 'm²', calc: ([l,w]) => l*w, guide: 'Best for playgrounds, farms, classrooms, fields and market spaces.', objects: [
    { name: 'Playground', icon: '🛝', scenario: 'A school needs a safe playground with enough space for mats and equipment.', effect: 'The answer expands the play zone.', color: '#a855f7', to: '/student/project/school-playground-layout' },
    { name: 'Farm plot', icon: '🌱', scenario: 'A school garden needs enough planting space for crop rows.', effect: 'The answer expands the farm bed.', color: '#16a34a', to: '/student/project/smart-irrigation-system' },
    { name: 'Football field', icon: '⚽', scenario: 'A coach marks out a training field.', effect: 'The answer changes the field size.', color: '#22c55e' }
  ]},
  { title: 'Speed Formula', formula: 'Speed = distance ÷ time', fields: ['distance','time'], defaults: [18,6], result: 'm/s', calc: ([d,t]) => t === 0 ? 0 : d/t, guide: 'Best for ferries, cars, rockets and moving systems.', objects: [
    { name: 'Ferry', icon: '⛴️', scenario: 'A ferry crosses a river safely within a set time.', effect: 'The answer controls the ferry speed.', color: '#0891b2', to: '/student/project/ferry-river-crossing' },
    { name: 'Parking car', icon: '🚗', scenario: 'A smart car moves from the gate to an empty space.', effect: 'The answer controls car movement.', color: '#ef4444', to: '/student/project/smart-car-parking-system' },
    { name: 'Rocket', icon: '🚀', scenario: 'A learning rocket launches upward.', effect: 'The answer changes launch speed.', color: '#f97316' }
  ]},
  { title: 'Water Flow Equation', formula: 'Water amount = flow rate × time', fields: ['flow rate','time'], defaults: [10,8], result: 'litres', calc: ([r,t]) => r*t, guide: 'Best for tanks, sprinklers, pipes and gutters.', objects: [
    { name: 'Irrigation system', icon: '💦', scenario: 'A smart garden waters crops through pipes and sprinklers.', effect: 'The answer powers the water spray and plant growth.', color: '#0ea5e9', to: '/student/project/smart-irrigation-system' },
    { name: 'Drainage gutter', icon: '🌧️', scenario: 'A road gutter carries rainwater away from homes.', effect: 'The answer changes water capacity.', color: '#0284c7', to: '/student/project/flood-safe-road-drainage-upgrade' },
    { name: 'Water tank', icon: '🚰', scenario: 'A tank fills from a pipe over time.', effect: 'The answer changes the tank water level.', color: '#14b8a6' }
  ]}
];

function fmt(value: number) { return Number.isFinite(value) ? (value % 1 ? value.toFixed(2) : value.toFixed(0)) : '0'; }

export default function EquationBuilderPage() {
  const [eqIndex, setEqIndex] = useState(0);
  const [objectIndex, setObjectIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('2d');
  const [values, setValues] = useState(equations[0].defaults);
  const [answer, setAnswer] = useState<number | null>(null);
  const eq = equations[eqIndex];
  const object = eq.objects[objectIndex];
  const shown = answer ?? eq.calc(values);
  const size = Math.max(16, Math.min(96, 18 + shown * 1.8));
  const chooseEq = (index: number) => { setEqIndex(index); setObjectIndex(0); setValues(equations[index].defaults); setAnswer(null); };
  const execute = () => setAnswer(eq.calc(values));

  return <main className="equation-builder-page">
    <header className="equation-builder-topbar"><Link to="/student/dashboard" className="equation-back">←</Link><div><h1>Equation Builder</h1><p>Choose an equation, choose what to build, insert values, then execute the equation.</p></div><nav><Link to="/student/dashboard" className="equation-nav-pill">Dashboard</Link><Link to="/" className="equation-logout">Logout</Link></nav></header>
    <section className="equation-builder-workspace">
      <article className="equation-picker-card"><Link to="/student/worlds" className="equation-link">← Back to Missions</Link><h2>{eq.title}</h2><div className="equation-formula-box">{eq.formula}</div><h3>1. Choose the equation</h3><div className="equation-chip-grid">{equations.map((item,i)=><button type="button" className={i===eqIndex?'active':''} onClick={()=>chooseEq(i)} key={item.title}>{item.title}</button>)}</div><h3>2. Choose what to build</h3><div className="equation-object-grid">{eq.objects.map((item,i)=><button type="button" className={i===objectIndex?'active':''} onClick={()=>{setObjectIndex(i);setAnswer(null)}} key={item.name}><span>{item.icon}</span>{item.name}</button>)}</div><h3>3. Insert values</h3><div className="equation-value-grid">{eq.fields.map((field,i)=><label key={field}><span>{field}</span><input type="number" value={values[i]} onChange={event=>{setAnswer(null);setValues(current=>current.map((value,index)=>index===i?Number(event.target.value):value))}} /></label>)}</div><button type="button" className="equation-execute" onClick={execute}>Execute Equation</button></article>
      <article className="equation-preview-card"><div className="equation-preview-heading"><div><span>Scenario</span><h2>{object.name}</h2></div><span className="equation-preview-icon">{object.icon}</span></div><p className="equation-meaning">{object.scenario}</p><div className="equation-mode-switch"><button type="button" className={mode==='2d'?'active':''} onClick={()=>setMode('2d')}>2D Preview</button><button type="button" className={mode==='3d'?'active':''} onClick={()=>setMode('3d')}>3D Preview</button></div><div className={`equation-preview-stage ${mode==='3d'?'equation-stage-3d':''}`}><div className="equation-preview-ground"><div className="equation-preview-object" style={{width:`${size}%`,background:object.color}}>{object.icon}</div><div className="equation-preview-shadow" /></div><strong>{answer===null?'Waiting for execution':`${fmt(answer)} ${eq.result}`}</strong><p>{answer===null?'Click Execute Equation to make the preview respond.':object.effect}</p></div><aside className="equation-ai-assistant"><span>AI Maths Assistant</span><p>{answer===null?eq.guide:`${eq.formula} gives ${fmt(answer)} ${eq.result}. ${object.effect}`}</p><small>Explain what each value means in the real situation.</small></aside><div className="equation-preview-actions">{object.to?<Link to={object.to}>Open related mission</Link>:<Link to="/student/missions">Explore missions</Link>}<button type="button" onClick={execute}>Build Preview</button></div></article>
    </section>
    <section className="equation-map-section"><div className="equation-section-title"><h2>Exact equation to object mapping</h2><p>Every formula becomes a practical builder choice.</p></div><div className="equation-map-grid">{equations.map(item=><article className="equation-map-card" key={item.title}><h3>{item.title}</h3><code>{item.formula}</code><ul>{item.objects.map(build=><li key={build.name}>{build.icon} {build.name}<em>{build.effect}</em></li>)}</ul></article>)}</div></section>
  </main>;
}
