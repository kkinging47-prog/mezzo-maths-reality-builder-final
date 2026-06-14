import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../equation-builder.css';

type BuilderObject = {
  name: string;
  icon: string;
  builds: string;
  example: string;
  missionTo?: string;
};

type EquationMap = {
  id: string;
  title: string;
  formula: string;
  childMeaning: string;
  colour: string;
  objects: BuilderObject[];
};

const equationMaps: EquationMap[] = [
  {
    id: 'linear',
    title: 'Linear Equation',
    formula: 'y = mx + c',
    childMeaning: 'Use a starting value and a steady change to build slopes, routes, ramps, and straight-line designs.',
    colour: 'blue',
    objects: [
      { name: 'Bridge', icon: '🌉', builds: 'Bridge deck slope and support height', example: 'y shows the bridge height as the distance x changes.', missionTo: '/student/project/footbridge-stream' },
      { name: 'Road', icon: '🛣️', builds: 'Road gradient and raised road level', example: 'A road can rise gradually using a fixed slope.' },
      { name: 'Robot Route', icon: '🤖', builds: 'Straight robot movement path', example: 'The robot follows a line from one point to another.' },
      { name: 'Water Pipe', icon: '🚰', builds: 'Pipe route from tank to garden', example: 'The pipe line moves across the garden at a steady angle.' },
    ],
  },
];

export default function EquationBuilderPage() {
  const [selectedEquationId, setSelectedEquationId] = useState(equationMaps[0].id);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(0);

  const selectedEquation = useMemo(
    () => equationMaps.find((equation) => equation.id === selectedEquationId) ?? equationMaps[0],
    [selectedEquationId],
  );
  const selectedObject = selectedEquation.objects[selectedObjectIndex] ?? selectedEquation.objects[0];

  return (
    <main className="equation-builder-page">
      <header className="equation-builder-topbar">
        <Link to="/student/dashboard" className="equation-back" aria-label="Back to dashboard">←</Link>
        <div>
          <h1>Equation Builder</h1>
          <p>Pick an equation. Choose what it can build. See mathematics become reality.</p>
        </div>
        <nav aria-label="Equation builder actions">
          <Link to="/student/dashboard" className="equation-nav-pill">⌂ Dashboard</Link>
          <Link to="/" className="equation-logout">↪ Logout</Link>
        </nav>
      </header>
      <section className="equation-builder-workspace" aria-label="Equation to object builder">
        <article className="equation-picker-card">
          <h2>{selectedEquation.title}</h2>
          <div className={`equation-formula-box equation-${selectedEquation.colour}`}>{selectedEquation.formula}</div>
          <p className="equation-meaning">{selectedEquation.childMeaning}</p>
          <h3>Choose what you want to create</h3>
          <div className="equation-object-grid">
            {selectedEquation.objects.map((object, index) => (
              <button type="button" key={object.name} className={index === selectedObjectIndex ? 'active' : ''} onClick={() => setSelectedObjectIndex(index)}>
                <span aria-hidden="true">{object.icon}</span>{object.name}
              </button>
            ))}
          </div>
        </article>
        <article className="equation-preview-card">
          <div className="equation-preview-heading"><div><span>Preview</span><h2>{selectedObject.name}</h2></div><span className="equation-preview-icon">{selectedObject.icon}</span></div>
          <div className="equation-preview-stage preview-blue"><div className="equation-preview-object">{selectedObject.icon}</div><strong>{selectedObject.builds}</strong><p>{selectedObject.example}</p></div>
        </article>
      </section>
    </main>
  );
}
