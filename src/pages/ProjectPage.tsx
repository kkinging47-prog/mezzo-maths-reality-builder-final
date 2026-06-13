import { Link, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import MissionEngine from '../components/MissionEngine';
import { findProject } from '../data/projects';

export default function ProjectPage() {
  const { projectId } = useParams();
  const project = findProject(projectId);

  if (!project) {
    return (
      <PageShell>
        <section className="section empty-state card">
          <h1>Project not found</h1>
          <p>This project is not active yet. Go back to the maths worlds and select a beginner mission.</p>
          <Link className="btn btn-primary" to="/student/worlds">Back to worlds</Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="section project-hero">
        <div>
          <span className="eyebrow">{project.level} · {project.age}</span>
          <h1>{project.title}</h1>
          <p>{project.description}</p>
          <div className="tag-row">
            {project.maths.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>
      <section className="section no-top">
        <MissionEngine project={project} />
      </section>
    </PageShell>
  );
}
