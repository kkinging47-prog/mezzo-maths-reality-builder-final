import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { worlds } from '../data/projects';

const featureCards = [
  {
    icon: '▦',
    title: 'Build with Equations',
    body: 'Students use algebra and formulas to unlock structures.',
  },
  {
    icon: '▰',
    title: 'Explore Geometry in 3D',
    body: 'Students use angles, shapes, area, perimeter, and volume to design objects.',
  },
  {
    icon: '◎',
    title: 'Solve Real-Life Missions',
    body: 'Students complete challenges such as building bridges, designing houses, launching ships, managing farms, and creating robots.',
  },
  {
    icon: '⌂',
    title: 'Track Student Progress',
    body: 'Teachers can monitor performance, completed missions, scores, and concept mastery.',
  },
  {
    icon: '⌁',
    title: 'Learn Through African Examples',
    body: 'Students solve problems connected to markets, farms, school buildings, water tanks, roads, football fields, and solar energy.',
  },
  {
    icon: '⌘',
    title: 'Future-Ready VR Learning',
    body: 'The platform is designed to support VR glasses and immersive learning experiences in the future.',
  },
];

const worldDescriptions: Record<string, string> = {
  'bridge-builder': 'Use geometry, angles, and Pythagoras theorem to design strong bridges.',
  'smart-city': 'Design buildings, roads, parks and playgrounds using area, perimeter, and scale drawing.',
  'ship-engineering': 'Build and launch ships using volume, capacity, speed, and distance.',
  'robotics-arena': 'Use civil engineering maths to raise roads, design gutters, and reduce flooding.',
  'farm-market': 'Use water, quantity, money, and business maths to solve farm and market problems.',
  'space-lab': 'Build smart systems using area, sensors, counting, and display logic.',
};

export default function LandingPage() {
  return (
    <PageShell>
      <div className="figma-home">
        <section className="figma-hero" id="about">
          <h1>Mezzo Maths Reality Builder</h1>
          <h2>Learn Mathematics by Building Real-World Creations</h2>
          <p>
            Transform mathematics from abstract formulas into practical, visual, and exciting experiences.
            Students solve equations, apply geometry, calculate measurements, and use mathematical thinking
            to build amazing real-life structures.
          </p>
          <div className="figma-actions">
            <Link className="figma-btn figma-btn-primary" to="/student/worlds">Enter Maths World</Link>
            <Link className="figma-btn figma-btn-outline" to="/demo">Watch Demo</Link>
          </div>
        </section>

        <section className="figma-section figma-features" id="demo">
          <h2>Where Mathematics Becomes Reality</h2>
          <div className="figma-card-grid">
            {featureCards.map((card) => (
              <article className="figma-feature-card" key={card.title}>
                <span className="figma-icon" aria-hidden="true">{card.icon}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="figma-worlds figma-section">
          <div className="figma-section-title">
            <h2>Choose Your Maths World</h2>
            <p>Six exciting worlds where mathematics becomes an adventure</p>
          </div>
          <div className="figma-world-grid">
            {worlds.map((world) => (
              <Link className={`figma-world-card figma-world-${world.color}`} key={world.id} to={`/student/project/${world.activeProjectId}`}>
                <span className="figma-world-icon" aria-hidden="true">{world.icon}</span>
                <h3>{world.name}</h3>
                <p>{worldDescriptions[world.id] ?? world.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="figma-school-cta">
          <h2>Bring Practical Mathematics to Your School</h2>
          <p>
            Register your school and give students the opportunity to experience mathematics as builders,
            engineers, designers, and problem-solvers.
          </p>
          <div className="figma-actions figma-actions-center">
            <Link className="figma-btn figma-btn-white" to="/school-admin/dashboard">Register Your School</Link>
            <Link className="figma-btn figma-btn-outline-white" to="/demo">Book a Demo</Link>
            <Link className="figma-btn figma-btn-orange" to="/role-selection">Start Pilot Programme</Link>
          </div>
        </section>

        <section className="figma-vr-section" id="pricing">
          <div className="figma-vr-content">
            <span className="figma-vr-icon" aria-hidden="true">⌘</span>
            <h2>Experience Mathematics in VR</h2>
            <p>
              Mezzo Maths Reality Builder is designed to help students enter practical maths worlds using web mode today
              and VR headsets in the future.
            </p>
            <div className="figma-vr-cards">
              <article><span>▱</span><strong>Web Mode Today</strong><p>Students can build from any modern browser.</p></article>
              <article><span>▰</span><strong>Interactive Missions</strong><p>Every answer unlocks part of a real-world project.</p></article>
              <article><span>⌘</span><strong>VR Ready Future</strong><p>Prepared for immersive learning and school VR labs.</p></article>
            </div>
            <div className="figma-actions figma-actions-center">
              <Link className="figma-btn figma-btn-white" to="/vr-preview">Preview VR Mode</Link>
              <Link className="figma-btn figma-btn-outline-white" to="/demo">Book School VR Lab Demo</Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
