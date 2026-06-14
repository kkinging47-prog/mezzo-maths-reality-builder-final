import { Link } from 'react-router-dom';
import { projects, worlds } from '../data/projects';

const descriptions: Record<string, string> = {
  'bridge-builder': 'Build a footbridge using length, measurement, support positions and safety load.',
  'smart-city': 'Build a safe school playground using area, perimeter, spacing and safety planning.',
  'ship-engineering': 'Build a ferry crossing using measurement, area, seating and load capacity.',
  'robotics-arena': 'Raise a road and rebuild gutters using depth, width, area and water flow.',
  'farm-market': 'Build a smart irrigation system using area, percentages, water and timing.',
  'space-lab': 'Build an automated car park using arrays, counting, sensors and subtraction.',
};

export default function StudentWorldsPage() {
  return (
    <main className="student-worlds-clean">
      <section className="student-worlds-topbar">
        <Link to="/student/dashboard" className="student-worlds-back" aria-label="Back to dashboard">Back</Link>
        <div>
          <h1>Maths World Adventure</h1>
          <p>Choose a world and start one of the six active beginner missions.</p>
        </div>
        <nav>
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/">Exit</Link>
        </nav>
      </section>

      <section className="student-worlds-wrap">
        <span className="worlds-eyebrow">All six active projects</span>
        <h2>Active Beginner Missions</h2>
        <div className="student-worlds-grid">
          {worlds.map((world) => {
            const project = projects.find((item) => item.id === world.activeProjectId);
            return (
              <article className={`student-world-tile world-${world.color}`} key={world.id}>
                <div className="student-world-tile-head">
                  <span>{world.icon}</span>
                  <h3>{world.name}</h3>
                  <p>{descriptions[world.id] ?? world.tagline}</p>
                </div>
                <div className="student-world-tile-body">
                  <small>Active mission</small>
                  <strong>{project?.title}</strong>
                  <div className="worlds-badges"><span>2D Ready</span><span>3D Ready</span><span>VR Preview</span></div>
                  <Link to={`/student/project/${world.activeProjectId}`}>Start Mission</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
