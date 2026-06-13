import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const earnedCertificates = [
  {
    title: 'Mezzo Maths Starter Certificate',
    status: 'Earned',
    date: '12 June 2026',
    description: 'Completed first set of maths reality builder missions.',
    badge: '🌟'
  },
  {
    title: 'Smart City Maths Certificate',
    status: 'Earned',
    date: '14 June 2026',
    description: 'Completed practical city design and measurement missions.',
    badge: '🏙️'
  },
  {
    title: 'Engineering Problem Solver Certificate',
    status: 'Earned',
    date: '18 June 2026',
    description: 'Solved bridge, road, drainage, and transport maths challenges.',
    badge: '🏗️'
  }
];

const progressCertificates = [
  {
    title: 'STEM Builder Certificate',
    progress: 72,
    requirement: 'Complete 2 more missions',
    badge: '🚀'
  },
  {
    title: 'Maths Champion Certificate',
    progress: 55,
    requirement: 'Reach top 10 on the leaderboard',
    badge: '🏆'
  },
  {
    title: 'Consistency Star Certificate',
    progress: 40,
    requirement: 'Keep a 7-day learning streak',
    badge: '🔥'
  }
];

const journeySteps = [
  { icon: '🎯', title: 'Start Learning', text: 'Choose a maths world and begin your first mission.' },
  { icon: '🧩', title: 'Complete Missions', text: 'Solve practical problems and build real-world projects.' },
  { icon: '⭐', title: 'Earn Badges', text: 'Collect badges for speed, accuracy, and consistency.' },
  { icon: '📜', title: 'Unlock Certificates', text: 'Reach key milestones and unlock your certificates.' },
  { icon: '🚀', title: 'Share Your Achievement', text: 'Celebrate your progress with teachers, parents, and friends.' }
];

function handlePreview() {
  window.alert('Certificate preview will be available soon.');
}

export default function StudentCertificates() {
  return (
    <PageShell>
      <style>{`
        .certificates-page { color: #0f172a; }
        .certificates-page .section { max-width: 1220px; }
        .cert-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) auto;
          gap: 1.2rem;
          align-items: center;
          border-radius: 2rem;
          padding: clamp(1.35rem, 3vw, 2.35rem);
          background:
            radial-gradient(circle at 88% 14%, rgba(59, 130, 246, .18), transparent 15rem),
            linear-gradient(135deg, #ffffff 0%, #f5f3ff 44%, #eef7ff 100%);
          border: 1px solid rgba(124, 58, 237, .14);
          box-shadow: 0 26px 70px rgba(76, 29, 149, .12);
        }
        .cert-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: .45rem .78rem;
          color: #5b21b6;
          background: #ede9fe;
          font-weight: 900;
          font-size: .82rem;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .cert-hero h1 {
          margin: .45rem 0 .75rem;
          color: #111827;
          font-size: clamp(2.2rem, 4vw, 3.6rem);
          line-height: 1.02;
          letter-spacing: -.05em;
        }
        .cert-hero p { color: #64748b; max-width: 44rem; margin: 0; }
        .cert-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.25rem; }
        .cert-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2.75rem;
          border: 0;
          border-radius: 999px;
          padding: .78rem 1rem;
          cursor: pointer;
          font-weight: 900;
          text-decoration: none;
        }
        .cert-button.primary { color: #ffffff; background: linear-gradient(135deg, #2563eb, #9333ea); box-shadow: 0 16px 34px rgba(79, 70, 229, .24); }
        .cert-button.secondary { color: #4c1d95; background: #ffffff; border: 1px solid rgba(124, 58, 237, .18); }
        .cert-hero-badge {
          min-width: min(100%, 270px);
          border-radius: 1.5rem;
          padding: 1.15rem;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(124, 58, 237, .16);
          box-shadow: 0 18px 45px rgba(15, 23, 42, .08);
        }
        .cert-hero-badge span { font-size: 2.3rem; }
        .cert-hero-badge strong { display: block; margin-top: .6rem; font-size: 2rem; letter-spacing: -.04em; color: #111827; }
        .cert-hero-badge small { color: #64748b; font-weight: 800; }
        .cert-summary-grid, .cert-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }
        .cert-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .cert-card, .cert-summary-card, .cert-journey-card {
          border-radius: 1.45rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 55px rgba(15, 23, 42, .08);
        }
        .cert-summary-card { padding: 1rem; }
        .cert-summary-card span { display: inline-flex; font-size: 1.7rem; margin-bottom: .75rem; }
        .cert-summary-card strong { display: block; color: #111827; font-size: 1.75rem; letter-spacing: -.04em; }
        .cert-summary-card small { color: #64748b; font-weight: 800; }
        .cert-section-header { margin: 1.8rem 0 1rem; }
        .cert-section-header h2 { margin: 0 0 .35rem; color: #111827; font-size: clamp(1.45rem, 2.4vw, 2rem); letter-spacing: -.03em; }
        .cert-section-header p { margin: 0; color: #64748b; }
        .cert-card {
          position: relative;
          overflow: hidden;
          min-height: 18rem;
          padding: 1.2rem;
        }
        .cert-card::after {
          content: '';
          position: absolute;
          inset: auto -2.5rem -3.2rem auto;
          width: 9rem;
          height: 9rem;
          border-radius: 999px;
          background: rgba(147, 51, 234, .09);
        }
        .cert-badge-icon {
          width: 4.2rem;
          height: 4.2rem;
          display: grid;
          place-items: center;
          border-radius: 1.25rem;
          background: linear-gradient(135deg, #eff6ff, #f5f3ff);
          font-size: 2.1rem;
        }
        .cert-status {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: .35rem;
          margin-top: 1rem;
          border-radius: 999px;
          padding: .4rem .68rem;
          color: #047857;
          background: #d1fae5;
          font-weight: 900;
          font-size: .82rem;
        }
        .cert-card h3 { margin: .8rem 0 .35rem; color: #111827; }
        .cert-card p { color: #64748b; margin: 0 0 .85rem; font-weight: 650; }
        .cert-date { display: block; color: #7c3aed; font-weight: 900; margin-bottom: .95rem; }
        .cert-preview-btn {
          position: relative;
          z-index: 2;
          border: 0;
          border-radius: 999px;
          padding: .72rem .9rem;
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #9333ea);
          cursor: pointer;
          font-weight: 900;
        }
        .progress-card .cert-status { color: #92400e; background: #fef3c7; }
        .cert-progress-meta { display: flex; justify-content: space-between; gap: .75rem; margin-top: 1rem; color: #334155; font-weight: 900; }
        .cert-progress-track {
          height: .75rem;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
          margin: .65rem 0 .85rem;
        }
        .cert-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #2563eb, #9333ea);
        }
        .journey-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }
        .cert-journey-card { padding: 1rem; }
        .cert-journey-card span { font-size: 2rem; }
        .cert-journey-card h3 { margin: .75rem 0 .35rem; color: #111827; }
        .cert-journey-card p { margin: 0; color: #64748b; font-weight: 700; }
        @media(max-width: 1080px) {
          .cert-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .cert-grid { grid-template-columns: 1fr; }
          .journey-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media(max-width: 760px) {
          .cert-hero { grid-template-columns: 1fr; }
          .cert-summary-grid, .journey-grid { grid-template-columns: 1fr; }
          .cert-actions { flex-direction: column; }
          .cert-button { width: 100%; }
        }
      `}</style>
      <main className="certificates-page">
        <section className="section cert-hero">
          <div>
            <span className="cert-kicker">Achievement Centre</span>
            <h1>My Certificates</h1>
            <p>Celebrate your achievements and track your progress toward your next Mezzo Maths certificate.</p>
            <p style={{ marginTop: '.75rem' }}>Every mission you complete brings you closer to a new achievement.</p>
            <div className="cert-actions">
              <Link className="cert-button primary" to="/student/worlds">Continue Learning</Link>
              <Link className="cert-button secondary" to="/student/progress">View Progress</Link>
            </div>
          </div>
          <aside className="cert-hero-badge" aria-label="Certificate progress highlight">
            <span>📜</span>
            <strong>72%</strong>
            <small>toward STEM Builder Certificate</small>
          </aside>
        </section>

        <section className="section cert-summary-grid" aria-label="Certificates summary">
          <article className="cert-summary-card"><span>📜</span><strong>3</strong><small>Certificates Earned</small></article>
          <article className="cert-summary-card"><span>⭐</span><strong>8</strong><small>Badges Earned</small></article>
          <article className="cert-summary-card"><span>📈</span><strong>72%</strong><small>Certificate Progress</small></article>
          <article className="cert-summary-card"><span>🚀</span><strong>STEM Builder</strong><small>Next Certificate</small></article>
        </section>

        <section className="section">
          <div className="cert-section-header">
            <h2>Earned Certificates</h2>
            <p>These certificates are unlocked and ready for preview.</p>
          </div>
          <div className="cert-grid">
            {earnedCertificates.map((certificate) => (
              <article className="cert-card" key={certificate.title}>
                <div className="cert-badge-icon">{certificate.badge}</div>
                <span className="cert-status">✓ {certificate.status}</span>
                <h3>{certificate.title}</h3>
                <small className="cert-date">Earned on {certificate.date}</small>
                <p>{certificate.description}</p>
                <button className="cert-preview-btn" type="button" onClick={handlePreview}>View Certificate</button>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cert-section-header">
            <h2>Certificates In Progress</h2>
            <p>Keep learning to unlock your next achievement.</p>
          </div>
          <div className="cert-grid">
            {progressCertificates.map((certificate) => (
              <article className="cert-card progress-card" key={certificate.title}>
                <div className="cert-badge-icon">{certificate.badge}</div>
                <span className="cert-status">In Progress</span>
                <h3>{certificate.title}</h3>
                <div className="cert-progress-meta">
                  <span>{certificate.progress}% complete</span>
                  <span>Locked</span>
                </div>
                <div className="cert-progress-track" role="progressbar" aria-label={`${certificate.title} progress is ${certificate.progress}%`} aria-valuenow={certificate.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="cert-progress-fill" style={{ width: `${certificate.progress}%` }} />
                </div>
                <p>{certificate.requirement}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cert-section-header">
            <h2>Your Certificate Journey</h2>
            <p>Follow the path from first mission to shareable achievement.</p>
          </div>
          <div className="journey-grid">
            {journeySteps.map((step, index) => (
              <article className="cert-journey-card" key={step.title}>
                <span aria-hidden="true">{step.icon}</span>
                <h3>{index + 1}. {step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
