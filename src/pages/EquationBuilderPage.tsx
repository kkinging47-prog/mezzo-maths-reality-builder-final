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
  {
    id: 'area',
    title: 'Area Formula',
    formula: 'Area = length × width',
    childMeaning: 'Use length and width to plan land, floors, mats, parks, farms, rooms, and pitches.',
    colour: 'purple',
    objects: [
      { name: 'Playground', icon: '🛝', builds: 'Safe play surface and mat coverage', example: '12 m × 8 m builds a 96 m² playground.', missionTo: '/student/project/school-playground-layout' },
      { name: 'Classroom', icon: '🏫', builds: 'Classroom floor and desk zones', example: 'Area helps arrange desks and walking space.' },
      { name: 'Football Field', icon: '⚽', builds: 'Pitch size and training zones', example: 'Length × width gives the field space.' },
      { name: 'Farm Plot', icon: '🌱', builds: 'Crop beds and irrigation zones', example: 'Area shows how much land can be planted.', missionTo: '/student/project/smart-irrigation-system' },
    ],
  },
  {
    id: 'perimeter',
    title: 'Perimeter Formula',
    formula: 'Perimeter = 2(length + width)',
    childMeaning: 'Use perimeter to build boundaries, fences, walls, rails, and safety lines around a shape.',
    colour: 'green',
    objects: [
      { name: 'Fence', icon: '🚧', builds: 'Fence around a playground or farm', example: 'Perimeter tells how much fencing is needed.' },
      { name: 'Classroom Border', icon: '📏', builds: 'Skirting, wall trim, or safety lines', example: 'Add all sides to know the boundary length.' },
      { name: 'Football Pitch Outline', icon: '🥅', builds: 'Boundary lines around a field', example: 'The line painter follows the perimeter.' },
      { name: 'Market Stall Frame', icon: '🏪', builds: 'Wooden frame around a stall', example: 'The frame length comes from the perimeter.' },
    ],
  },
  {
    id: 'volume',
    title: 'Volume Formula',
    formula: 'Volume = length × width × height',
    childMeaning: 'Use volume to build tanks, boxes, cargo holds, storage rooms, and containers.',
    colour: 'cyan',
    objects: [
      { name: 'Water Tank', icon: '💧', builds: 'Water storage capacity', example: 'Volume tells how much water a tank can hold.' },
      { name: 'Storage Box', icon: '📦', builds: 'Box size for tools or supplies', example: 'Length × width × height gives box space.' },
      { name: 'Ship Cargo Hold', icon: '⛴️', builds: 'Cargo space inside a ferry or ship', example: 'Volume helps decide how much cargo fits.', missionTo: '/student/project/ferry-river-crossing' },
      { name: 'Classroom Block', icon: '🏢', builds: 'Room and building space', example: 'Volume helps compare building sizes.' },
    ],
  },
  {
    id: 'speed',
    title: 'Speed Formula',
    formula: 'Speed = distance ÷ time',
    childMeaning: 'Use speed to move ships, ferries, robots, rockets, delivery carts, and vehicles.',
    colour: 'orange',
    objects: [
      { name: 'Ferry', icon: '⛴️', builds: 'River crossing time and trips', example: 'Speed tells how fast the ferry crosses.', missionTo: '/student/project/ferry-river-crossing' },
      { name: 'Rocket', icon: '🚀', builds: 'Launch path and travel time', example: 'Distance ÷ time gives rocket speed.' },
      { name: 'Robot', icon: '🤖', builds: 'Movement speed across a grid', example: 'A robot covers a distance in a set time.' },
      { name: 'Smart Parking Car', icon: '🚗', builds: 'Car movement to an empty slot', example: 'Speed helps animate safe car movement.', missionTo: '/student/project/smart-car-parking-system' },
    ],
  },
  {
    id: 'cost',
    title: 'Cost Equation',
    formula: 'Total cost = price × quantity',
    childMeaning: 'Use cost equations to build market stalls, budgets, school supply plans, and project material lists.',
    colour: 'pink',
    objects: [
      { name: 'Market Stall', icon: '🛒', builds: 'Stock and selling budget', example: 'Price × quantity gives total stock cost.' },
      { name: 'Bridge Materials', icon: '🪵', builds: 'Planks and post budget', example: 'Count materials and multiply by price.', missionTo: '/student/project/footbridge-stream' },
      { name: 'Playground Mats', icon: '🧩', builds: 'Safety mat budget', example: 'Mat price × number of mats gives cost.', missionTo: '/student/project/school-playground-layout' },
      { name: 'School Shop', icon: '🏪', builds: 'Items, sales, and budgeting', example: 'Total cost helps plan supplies.' },
    ],
  },
  {
    id: 'pythagoras',
    title: 'Pythagoras Theorem',
    formula: 'a² + b² = c²',
    childMeaning: 'Use right triangles to build ramps, ladders, roof supports, bridge braces, and diagonal paths.',
    colour: 'indigo',
    objects: [
      { name: 'Bridge Brace', icon: '🌉', builds: 'Diagonal support strength', example: 'Find the diagonal brace length for the bridge.', missionTo: '/student/project/footbridge-stream' },
      { name: 'Slide Ladder', icon: '🛝', builds: 'Safe ladder and slide angle', example: 'Find the slanted ladder distance.', missionTo: '/student/project/school-playground-layout' },
      { name: 'Roof Truss', icon: '🏠', builds: 'Roof support triangle', example: 'Triangle sides make the roof stable.' },
      { name: 'Road Ramp', icon: '🛣️', builds: 'Ramp length and height', example: 'A ramp forms a right triangle.' },
    ],
  },
  {
    id: 'flow',
    title: 'Flow Equation',
    formula: 'Water amount = flow rate × time',
    childMeaning: 'Use water flow to build irrigation systems, gutters, tanks, drainage channels, and sprinklers.',
    colour: 'teal',
    objects: [
      { name: 'Irrigation System', icon: '💦', builds: 'Water pipes and sprinklers', example: 'Flow rate × time gives water delivered.', missionTo: '/student/project/smart-irrigation-system' },
      { name: 'Drainage Gutter', icon: '🌧️', builds: 'Rainwater flow channel', example: 'More flow means the gutter must carry more water.', missionTo: '/student/project/flood-safe-road-drainage-upgrade' },
      { name: 'Water Tank Filling', icon: '🚰', builds: 'Tank fill time and capacity', example: 'Flow tells how quickly a tank fills.' },
      { name: 'Farm Sprinklers', icon: '🌱', builds: 'Watering plan for crops', example: 'Each sprinkler waters a zone over time.' },
    ],
  },
  {
    id: 'arrays',
    title: 'Array Equation',
    formula: 'Total = rows × columns',
    childMeaning: 'Use rows and columns to build car parks, classrooms, seating, farms, mats, and storage layouts.',
    colour: 'rose',
    objects: [
      { name: 'Car Parking System', icon: '🅿️', builds: 'Parking slots and sensors', example: 'Rows × columns gives total parking spaces.', missionTo: '/student/project/smart-car-parking-system' },
      { name: 'Classroom Desks', icon: '🪑', builds: 'Desk seating arrangement', example: 'Rows of desks make a classroom layout.' },
      { name: 'Safety Mats', icon: '🧩', builds: 'Playground mat grid', example: 'Rows × columns gives total mats.', missionTo: '/student/project/school-playground-layout' },
      { name: 'Farm Beds', icon: '🌾', builds: 'Crop rows and planting spaces', example: 'Plant rows and columns to count crops.' },
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

  const chooseEquation = (equationId: string) => {
    setSelectedEquationId(equationId);
    setSelectedObjectIndex(0);
  };

  return (
    <main className="equation-builder-page">
      <header className="equation-builder-topbar">
        <Link to="/student/worlds" className="equation-back" aria-label="Back to maths worlds">←</Link>
        <div>
          <h1>Equation Builder</h1>
          <p>Pick an equation. Choose what it can build. See mathematics become reality.</p>
        </div>
        <nav aria-label="Equation builder actions">
          <Link to="/student/dashboard" className="equation-nav-pill">⌂ Dashboard</Link>
          <Link to="/login" className="equation-logout">↪ Logout</Link>
        </nav>
      </header>

      <section className="equation-builder-hero">
        <div>
          <span>Build with formulas</span>
          <h2>Every equation can become a real object.</h2>
          <p>
            Students do not only solve for an answer. They use the answer to build bridges, playgrounds,
            water tanks, farms, roads, robots, ferries, and smart systems.
          </p>
        </div>
        <div className="equation-hero-badges" aria-label="Equation builder highlights">
          <strong>12+</strong><span>real-world creations</span>
          <strong>9</strong><span>maths equation families</span>
        </div>
      </section>

      <section className="equation-builder-workspace" aria-label="Equation to object builder">
        <article className="equation-picker-card">
          <Link to="/student/worlds" className="equation-link">← Back to Maths Worlds</Link>
          <h2>{selectedEquation.title}</h2>
          <div className={`equation-formula-box equation-${selectedEquation.colour}`}>{selectedEquation.formula}</div>
          <p className="equation-meaning">{selectedEquation.childMeaning}</p>

          <h3>Choose the equation family</h3>
          <div className="equation-chip-grid">
            {equationMaps.map((equation) => (
              <button
                type="button"
                key={equation.id}
                className={equation.id === selectedEquation.id ? 'active' : ''}
                onClick={() => chooseEquation(equation.id)}
              >
                {equation.title}
              </button>
            ))}
          </div>

          <h3>Choose what you want to create</h3>
          <div className="equation-object-grid">
            {selectedEquation.objects.map((object, index) => (
              <button
                type="button"
                key={object.name}
                className={index === selectedObjectIndex ? 'active' : ''}
                onClick={() => setSelectedObjectIndex(index)}
              >
                <span aria-hidden="true">{object.icon}</span>
                {object.name}
              </button>
            ))}
          </div>
        </article>

        <article className="equation-preview-card">
          <div className="equation-preview-heading">
            <div>
              <span>Preview</span>
              <h2>{selectedObject.name}</h2>
            </div>
            <span className="equation-preview-icon" aria-hidden="true">{selectedObject.icon}</span>
          </div>
          <div className={`equation-preview-stage preview-${selectedEquation.colour}`}>
            <div className="equation-preview-object" aria-hidden="true">{selectedObject.icon}</div>
            <strong>{selectedObject.builds}</strong>
            <p>{selectedObject.example}</p>
          </div>
          <div className="equation-preview-actions">
            {selectedObject.missionTo ? <Link to={selectedObject.missionTo}>Open related mission</Link> : <Link to="/student/missions">Explore missions</Link>}
            <button type="button">Build Preview</button>
          </div>
        </article>
      </section>

      <section className="equation-map-section" aria-label="Exact equation to object mapping">
        <div className="equation-section-title">
          <span>Exact mapping</span>
          <h2>Which equations build which objects?</h2>
          <p>Use this table as the guide for the Equation Builder library.</p>
        </div>
        <div className="equation-map-grid">
          {equationMaps.map((equation) => (
            <article className={`equation-map-card equation-map-${equation.colour}`} key={equation.id}>
              <h3>{equation.title}</h3>
              <code>{equation.formula}</code>
              <p>{equation.childMeaning}</p>
              <ul>
                {equation.objects.map((object) => (
                  <li key={object.name}><span>{object.icon}</span><strong>{object.name}</strong><em>{object.builds}</em></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
