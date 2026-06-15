import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { projects } from '../data/projects';

const activeProjects = projects.filter((project) => project.status === 'active');

export default function StudentMissionsPage() {
  return (
    <PageShell>
      <main className="student-missions-page">
        <section className="student-missions-hero">
          <span>Mission centre</span>
          <h1>My Missions</h1>
          <p>All six active practical maths missions are ready. Continue a project, test a 2D/3D/VR scene, and keep building your STEM portfolio.</p>
          <div className="student-missions-actions">
            <Link to="/student/worlds">Maths Worlds</Link>
            <Link to="/student/progress">View progress</Link>
          </div>
        </section>
        <section className="student-missions-grid">
          {activeProjects.map((project) => (
            <article className="student-mission-card" key={project.id}>
              <div className="student-mission-icon">{project.id.includes('bridge') ? '🌉' : project.id.includes('playground') ? '🛝' : project.id.includes('ferry') ? '⛴️' : project.id.includes('irrigation') ? '💧' : project.id.includes('parking') ? '🅿️' : '🌧️'}</div>
              <span>{project.level} Mode</span>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="student-mission-tags">{project.maths.slice(0, 4).map((tag) => <em key={tag}>{tag}</em>)}</div>
              <Link to={`/student/project/${project.id}`}>Open mission</Link>
            </article>
          ))}
        </section>
      </main>
      <style>{`.student-missions-page{padding:2rem;color:#0f172a}.student-missions-hero{border-radius:2rem;padding:2rem;background:linear-gradient(135deg,#4f46e5,#8b5cf6,#06b6d4);color:white;box-shadow:0 24px 60px rgba(79,70,229,.22)}.student-missions-hero span{display:inline-flex;font-weight:900;text-transform:uppercase;letter-spacing:.12em;font-size:.76rem;background:rgba(255,255,255,.16);padding:.45rem .75rem;border-radius:999px}.student-missions-hero h1{font-size:clamp(2rem,4vw,3.4rem);line-height:1;margin:1rem 0 .75rem}.student-missions-hero p{max-width:820px;font-size:1.05rem;line-height:1.7;color:#e0f2fe}.student-missions-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.3rem}.student-missions-actions a,.student-mission-card a{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.75rem 1rem;font-weight:900;text-decoration:none}.student-missions-actions a:first-child{background:white;color:#4f46e5}.student-missions-actions a:last-child{background:rgba(255,255,255,.16);color:white;border:1px solid rgba(255,255,255,.32)}.student-missions-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:1.2rem}.student-mission-card{background:rgba(255,255,255,.95);border:1px solid rgba(148,163,184,.2);border-radius:1.4rem;padding:1.25rem;box-shadow:0 18px 45px rgba(15,23,42,.08)}.student-mission-icon{width:3.2rem;height:3.2rem;border-radius:1rem;display:grid;place-items:center;background:#eef2ff;font-size:1.55rem;margin-bottom:.85rem}.student-mission-card span{font-size:.78rem;font-weight:900;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em}.student-mission-card h2{font-size:1.04rem;margin:.35rem 0 .5rem;color:#1e1b4b}.student-mission-card p{font-size:.92rem;line-height:1.55;color:#475569}.student-mission-tags{display:flex;gap:.4rem;flex-wrap:wrap;margin:.8rem 0}.student-mission-tags em{font-style:normal;font-size:.75rem;font-weight:800;background:#f1f5f9;color:#334155;border-radius:999px;padding:.32rem .55rem}.student-mission-card a{background:linear-gradient(135deg,#2563eb,#a21caf);color:white;font-size:.9rem}@media(max-width:1080px){.student-missions-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.student-missions-page{padding:1rem}.student-missions-grid{grid-template-columns:1fr}.student-missions-hero{padding:1.35rem}.student-missions-actions a{width:100%}}`}</style>
    </PageShell>
  );
}
