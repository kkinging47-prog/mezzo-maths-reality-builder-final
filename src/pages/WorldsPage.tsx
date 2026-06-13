import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { comingSoonProjects, getActiveProjectForWorld, worlds } from '../data/projects';

export default function WorldsPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Maths worlds</span>
          <h1>Choose a world and start building</h1>
          <p>The MVP contains one complete beginner mission per world. More missions are marked as coming soon.</p>
        </div>
        <div className="world-grid large">
          {worlds.map((world, index) => {
            const project = getActiveProjectForWorld(world.id);
            return (
              <article className={`world-card ${world.color}`} key={world.id}>
                <span className="world-icon">{world.icon}</span>
                <h3>{world.name}</h3>
                <p>{world.tagline}</p>
                {project && <Link className="btn btn-light" to={`/student/project/${project.id}`}>Open beginner mission</Link>}
                <div className="coming-soon-box">
                  <strong>Coming soon</strong>
                  <span>{comingSoonProjects[index]}</span>
                  <span>Intermediate · Advanced · Expert</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
