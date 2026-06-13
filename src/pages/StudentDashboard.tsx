import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { projects } from '../data/projects';

export default function StudentDashboard() {
  return (
    <PageShell>
      <section className="section dashboard-hero">
        <div>
          <span className="eyebrow">Student dashboard</span>
          <h1>Hello Builder, ready for today’s maths mission?</h1>
          <p>Continue from a beginner project or explore the six learning worlds.</p>
        </div>
        <Link className="btn btn-primary" to="/student/worlds">Open Maths Worlds</Link>
      </section>
      <section className="section stats-grid">
        <StatCard label="XP" value="1,250" note="Bridge Builder level 3" />
        <StatCard label="Completed" value="4/6" note="Beginner missions started" />
        <StatCard label="Accuracy" value="87%" note="Across recent tasks" />
        <StatCard label="Badges" value="8" note="Certificates and streaks" />
      </section>
      <section className="section">
        <div className="section-heading left">
          <span className="eyebrow">Continue learning</span>
          <h2>Active beginner missions</h2>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <Link className="project-row card" key={project.id} to={`/student/project/${project.id}`}>
              <div>
                <strong>{project.title}</strong>
                <p>{project.description}</p>
              </div>
              <span>{project.level}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
