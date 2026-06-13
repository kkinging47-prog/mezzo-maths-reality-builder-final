import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';
import { worlds } from '../data/projects';

export default function LandingPage() {
  return (
    <PageShell>
      <section className="hero section">
        <div className="hero-copy">
          <span className="eyebrow">Practical maths for future builders</span>
          <h1>Students do not just learn mathematics. They use mathematics to build the world.</h1>
          <p>
            Mezzo Maths Reality Builder turns measurement, geometry, money, data and reasoning into interactive missions where learners build bridges, playgrounds, ferries, robots, markets and space missions.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/student/worlds">Start Building</Link>
            <Link className="btn btn-secondary" to="/demo">View Demo</Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="world-preview">
            <span>🌉</span>
            <strong>Build a Footbridge</strong>
            <p>Answer six maths questions and watch the bridge become complete.</p>
            <div className="mini-progress"><span /></div>
          </div>
        </div>
      </section>

      <section className="section stats-grid">
        <StatCard label="Learning Worlds" value="6" note="All with beginner missions" />
        <StatCard label="Mission Steps" value="36" note="Practical maths tasks" />
        <StatCard label="User Roles" value="5" note="Students, teachers, schools, sponsors and admins" />
        <StatCard label="Build Views" value="2D / 3D / VR" note="Ready for future WebXR upgrades" />
      </section>

      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Six worlds</span>
          <h2>Every topic feels like a real project</h2>
          <p>Each world has one fully working beginner mission now. Other levels can be added after the MVP is live.</p>
        </div>
        <div className="world-grid">
          {worlds.map((world) => (
            <Link className={`world-card ${world.color}`} key={world.id} to={`/student/project/${world.activeProjectId}`}>
              <span className="world-icon">{world.icon}</span>
              <h3>{world.name}</h3>
              <p>{world.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-panel section">
        <div>
          <span className="eyebrow">For schools</span>
          <h2>Bring practical mathematics into the classroom.</h2>
          <p>Teachers can assign missions, monitor progress and use the app as a visual maths laboratory.</p>
        </div>
        <Link className="btn btn-light" to="/role-selection">Choose your role</Link>
      </section>
    </PageShell>
  );
}
