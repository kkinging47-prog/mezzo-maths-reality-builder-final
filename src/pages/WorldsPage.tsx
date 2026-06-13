import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getActiveProjectForWorld, worlds } from '../data/projects';

const worldDescriptions: Record<string, string> = {
  'bridge-builder': 'Use geometry, angles, triangles, symmetry, ratio, and Pythagoras theorem to design strong bridges.',
  'smart-city': 'Design buildings, roads, parks, schools, and communities using area, perimeter, scale drawing, and coordinates.',
  'ship-engineering': 'Build and launch ships using volume, capacity, speed, distance, time, and balance.',
  'robotics-arena': 'Solve drainage and road safety problems using measurement, capacity, and practical civil engineering maths.',
  'farm-market': 'Run a farm and market using fractions, percentages, profit, loss, measurement, and statistics.',
  'space-lab': 'Build smart systems using area, sensors, counting, display logic, and practical automation maths.',
};

const worldIcons: Record<string, string> = {
  'bridge-builder': '🚧',
  'smart-city': '🏙️',
  'ship-engineering': '⛴️',
  'robotics-arena': '🌧️',
  'farm-market': '🌱',
  'space-lab': '🅿️',
};

export default function WorldsPage() {
  return (
    <PageShell>
      <section className="world-adventure-shell">
        <div className="student-topbar-card">
          <div>
            <Link className="back-circle" to="/student/dashboard" aria-label="Back to dashboard">←</Link>
          </div>
          <div className="student-topbar-title">
            <h1>Maths World Adventure</h1>
            <p>Choose a world and start your beginner mission</p>
          </div>
          <div className="student-topbar-actions">
            <Link className="topbar-btn dashboard" to="/student/dashboard">⌂ Dashboard</Link>
            <Link className="topbar-btn logout" to="/login">↪ Logout</Link>
          </div>
        </div>

        <div className="world-adventure-content">
          <h2>Active Beginner Missions</h2>
          <div className="adventure-world-grid">
            {worlds.map((world) => {
              const project = getActiveProjectForWorld(world.id);
              return (
                <article className={`adventure-world-card ${world.color}`} key={world.id}>
                  <div className="adventure-world-top">
                    <div className="adventure-icon" aria-hidden="true">{worldIcons[world.id] || world.icon}</div>
                    <h3>{world.name}</h3>
                    <p>{worldDescriptions[world.id] || world.tagline}</p>
                  </div>
                  <div className="adventure-world-bottom">
                    {project ? (
                      <>
                        <span className="active-label">Active Mission:</span>
                        <strong>{project.title}</strong>
                        <span className="concept-label">Concepts:</span>
                        <div className="concept-chip-row">
                          {project.maths.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
                        </div>
                        <div className="ready-chip-row">
                          <span>✓ 2D Ready</span>
                          <span>✓ 3D Ready</span>
                          <span>✓ VR Preview</span>
                        </div>
                        <Link className="mission-start-btn" to={`/student/project/${project.id}`}>Start Mission →</Link>
                      </>
                    ) : (
                      <>
                        <strong>Coming soon</strong>
                        <p>New missions are being prepared for this maths world.</p>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
