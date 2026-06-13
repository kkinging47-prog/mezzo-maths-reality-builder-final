import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { projects, worlds } from '../data/projects';

const summaryCards = [
  { label: 'Missions completed', value: '12', note: 'Across practical maths worlds', icon: '✅', tone: 'blue' },
  { label: 'Current level', value: 'Explorer', note: 'Keep building to unlock Builder', icon: '🧭', tone: 'purple' },
  { label: 'Total score', value: '2,450', note: '+320 this week', icon: '🏆', tone: 'gold' },
  { label: 'Learning streak', value: '7 days', note: 'Great consistency', icon: '🔥', tone: 'pink' }
];

const learningModes = [
  { title: 'Reality Builder Missions', description: 'Answer practical questions and build roads, bridges, ferries, farms and smart city systems.', icon: '🏗️', to: '/student/worlds' },
  { title: 'Quick Maths Practice', description: 'Short drills for speed, accuracy and confidence before starting a project.', icon: '⚡', to: '/student/missions' },
  { title: 'Equation Builder', description: 'Turn real-life problems into formulas and solve them step by step.', icon: '🧮', to: '/student/equation-builder' }
];

const recentActivity = [
  { title: 'Smart Parking System', detail: 'Completed sensor and available-space calculations', score: '+180 XP' },
  { title: 'Flood-Safe Road Engineering', detail: 'Raised road and redirected rainwater into side gutters', score: '+220 XP' },
  { title: 'Smart Irrigation System', detail: 'Programmed watering time and tested garden sprinklers', score: '+160 XP' }
];

export default function StudentDashboard() {
  const activeProjects = projects.filter((project) => project.status === 'active');
  const featuredProject = activeProjects.find((project) => project.id === 'flood-safe-road-drainage-upgrade') ?? activeProjects[0];

  return (
    <PageShell>
      <style>{`
        .student-dashboard-v2 {
          color: #0f172a;
        }
        .student-dashboard-v2 .section {
          max-width: 1220px;
        }
        .student-dashboard-v2 .dashboard-hero {
          align-items: stretch;
          border: 1px solid rgba(124, 58, 237, .14);
          background:
            radial-gradient(circle at 82% 18%, rgba(124, 58, 237, .18), transparent 16rem),
            linear-gradient(135deg, #ffffff 0%, #f6f3ff 48%, #eef7ff 100%);
          box-shadow: 0 26px 70px rgba(76, 29, 149, .12);
          border-radius: 2rem;
          padding: clamp(1.3rem, 3vw, 2.4rem);
        }
        .student-dashboard-v2 .dashboard-hero h1 {
          color: #111827;
          font-size: clamp(2rem, 4vw, 3.65rem);
          line-height: 1.03;
          letter-spacing: -.05em;
        }
        .student-dashboard-v2 .dashboard-hero p,
        .student-dashboard-v2 .dashboard-card p,
        .student-dashboard-v2 .student-muted {
          color: #64748b;
        }
        .dashboard-hero-actions {
          display: flex;
          gap: .75rem;
          flex-wrap: wrap;
          margin-top: 1.4rem;
        }
        .hero-progress-card {
          min-width: min(100%, 310px);
          border-radius: 1.6rem;
          padding: 1.15rem;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(124, 58, 237, .16);
          box-shadow: 0 22px 50px rgba(15, 23, 42, .08);
          display: grid;
          gap: .9rem;
        }
        .hero-progress-card strong {
          color: #111827;
          font-size: 1.15rem;
        }
        .dashboard-progress-line {
          height: .75rem;
          border-radius: 999px;
          background: #e9d5ff;
          overflow: hidden;
        }
        .dashboard-progress-line span {
          display: block;
          width: 72%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2563eb, #9333ea, #ec4899);
        }
        .student-dashboard-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding-bottom: 0;
        }
        .student-dashboard-topbar h1 {
          margin: .35rem 0 0;
          color: #f8fafc;
          font-size: clamp(1.75rem, 3vw, 2.6rem);
          letter-spacing: -.04em;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: .6rem;
          flex-wrap: wrap;
        }
        .topbar-pill {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          border-radius: 999px;
          padding: .7rem 1rem;
          font-weight: 900;
          background: rgba(255,255,255,.1);
          color: white;
          border: 1px solid rgba(255,255,255,.18);
        }
        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }
        .dashboard-stat-card,
        .dashboard-card {
          border-radius: 1.4rem;
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 55px rgba(15, 23, 42, .08);
        }
        .dashboard-stat-card {
          padding: 1rem;
          display: grid;
          gap: .55rem;
        }
        .stat-icon {
          width: 2.85rem;
          height: 2.85rem;
          display: grid;
          place-items: center;
          border-radius: 1rem;
          font-size: 1.4rem;
          background: linear-gradient(135deg, #2563eb, #9333ea);
          color: white;
        }
        .dashboard-stat-card[data-tone='gold'] .stat-icon { background: linear-gradient(135deg, #f59e0b, #f97316); }
        .dashboard-stat-card[data-tone='pink'] .stat-icon { background: linear-gradient(135deg, #ec4899, #ef4444); }
        .dashboard-stat-card[data-tone='purple'] .stat-icon { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .dashboard-stat-card strong {
          font-size: 1.8rem;
          letter-spacing: -.04em;
        }
        .dashboard-stat-card span,
        .dashboard-stat-card small {
          color: #64748b;
          font-weight: 700;
        }
        .dashboard-two-column {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr);
          gap: 1rem;
        }
        .dashboard-card {
          padding: 1.2rem;
        }
        .dashboard-card h2,
        .dashboard-card h3 {
          margin: 0 0 .4rem;
          color: #111827;
        }
        .continue-card {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #f8fafc, #eff6ff);
          border: 1px solid #dbeafe;
          margin-top: 1rem;
        }
        .continue-card strong { color: #111827; font-size: 1.05rem; }
        .mode-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .mode-card {
          padding: 1rem;
          border-radius: 1.2rem;
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 40px rgba(15, 23, 42, .06);
        }
        .mode-card span {
          font-size: 2rem;
          display: inline-grid;
          place-items: center;
          width: 3.4rem;
          height: 3.4rem;
          border-radius: 1rem;
          background: #f3e8ff;
          margin-bottom: .85rem;
        }
        .activity-list {
          display: grid;
          gap: .75rem;
          margin-top: 1rem;
        }
        .activity-row {
          display: flex;
          justify-content: space-between;
          gap: .8rem;
          align-items: center;
          padding: .85rem;
          border-radius: 1rem;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
        }
        .activity-row strong { color: #111827; }
        .activity-score { color: #16a34a; font-weight: 900; white-space: nowrap; }
        .world-chip-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: .75rem;
          margin-top: 1rem;
        }
        .world-chip {
          display: flex;
          align-items: center;
          gap: .6rem;
          border-radius: 1rem;
          padding: .8rem;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          color: #111827;
          font-weight: 900;
        }
        .world-chip span { font-size: 1.45rem; }
        @media(max-width: 1000px) {
          .dashboard-stat-grid,
          .mode-grid,
          .world-chip-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dashboard-two-column { grid-template-columns: 1fr; }
          .student-dashboard-v2 .dashboard-hero { flex-direction: column; }
        }
        @media(max-width: 640px) {
          .dashboard-stat-grid,
          .mode-grid,
          .world-chip-grid { grid-template-columns: 1fr; }
          .continue-card,
          .activity-row,
          .student-dashboard-topbar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="student-dashboard-v2">
        <section className="section student-dashboard-topbar">
          <div>
            <span className="eyebrow">Student dashboard</span>
            <h1>Welcome back, Ama Mensah!</h1>
          </div>
          <div className="topbar-actions">
            <Link className="topbar-pill" to="/student/worlds">📚 Maths Worlds</Link>
            <Link className="topbar-pill" to="/student/missions">⚡ Try quick quiz</Link>
          </div>
        </section>

        <section className="section dashboard-hero">
          <div>
            <span className="eyebrow">Reality Builder progress</span>
            <h1>Build real things with practical mathematics.</h1>
            <p>
              Continue your project missions, improve your accuracy and unlock certificates as you solve real-world maths problems.
            </p>
            <div className="dashboard-hero-actions">
              <Link className="btn btn-primary" to="/student/worlds">Continue learning</Link>
              <Link className="btn btn-secondary" to="/student/progress">View progress</Link>
            </div>
          </div>
          <div className="hero-progress-card">
            <span className="eyebrow">Certificate progress</span>
            <strong>72% toward Mezzo Maths Practical Learner Certificate</strong>
            <div className="dashboard-progress-line"><span /></div>
            <p className="student-muted">Complete two more missions to unlock your next badge.</p>
          </div>
        </section>

        <section className="section dashboard-stat-grid">
          {summaryCards.map((card) => (
            <article className="dashboard-stat-card" data-tone={card.tone} key={card.label}>
              <div className="stat-icon">{card.icon}</div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          ))}
        </section>

        <section className="section dashboard-two-column">
          <article className="dashboard-card">
            <span className="eyebrow">Continue where you stopped</span>
            <h2>{featuredProject?.title ?? 'Start your next mission'}</h2>
            <p>{featuredProject?.description ?? 'Choose a practical project and begin building with maths.'}</p>
            {featuredProject && (
              <Link className="continue-card" to={`/student/project/${featuredProject.id}`}>
                <div>
                  <strong>{featuredProject.title}</strong>
                  <p>{featuredProject.maths.slice(0, 4).join(' • ')}</p>
                </div>
                <span className="btn btn-primary btn-small">Resume</span>
              </Link>
            )}
            <div className="world-chip-grid" aria-label="Learning worlds">
              {worlds.map((world) => (
                <Link className="world-chip" key={world.id} to={`/student/project/${world.activeProjectId}`}>
                  <span>{world.icon}</span>
                  {world.name}
                </Link>
              ))}
            </div>
          </article>

          <article className="dashboard-card">
            <span className="eyebrow">Recent activity</span>
            <h2>Good progress this week</h2>
            <p>These are the latest practical maths actions completed in your learning account.</p>
            <div className="activity-list">
              {recentActivity.map((item) => (
                <div className="activity-row" key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span className="activity-score">{item.score}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="section">
          <div className="section-heading left">
            <span className="eyebrow">Explore learning modes</span>
            <h2>Choose how you want to practise today</h2>
          </div>
          <div className="mode-grid">
            {learningModes.map((mode) => (
              <Link className="mode-card" key={mode.title} to={mode.to}>
                <span>{mode.icon}</span>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
