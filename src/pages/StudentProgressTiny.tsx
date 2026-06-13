import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const weekly = [46, 62, 58, 74, 82, 68, 90];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mastery = [
  ['Measurement', 88],
  ['Multiplication', 82],
  ['Area', 76],
  ['Division', 69],
  ['Display Logic', 64]
] as const;

export default function StudentProgressTiny() {
  return (
    <PageShell>
      <section className="section">
        <span className="eyebrow">My progress</span>
        <h1>Track your practical maths growth</h1>
        <p>See your mission progress, topic mastery, improvement areas, badges and certificate progress.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/student/worlds">Continue missions</Link>
          <Link className="btn btn-secondary" to="/student/dashboard">Dashboard</Link>
        </div>
      </section>

      <section className="section project-grid">
        <article className="project-card"><span className="eyebrow">Missions completed</span><h2>12</h2><p>Across active practical maths worlds.</p></article>
        <article className="project-card"><span className="eyebrow">Current streak</span><h2>7 days</h2><p>You are building consistency.</p></article>
        <article className="project-card"><span className="eyebrow">Total score</span><h2>2,450 XP</h2><p>+320 XP this week.</p></article>
        <article className="project-card"><span className="eyebrow">Overall mastery</span><h2>76%</h2><p>Good progress. Keep improving.</p></article>
      </section>

      <section className="section split">
        <article className="project-card">
          <span className="eyebrow">My maths progress</span>
          <h2>Weekly learning score</h2>
          <div className="progress-bars">
            {weekly.map((score, index) => (
              <div className="progress-bar-column" key={days[index]}>
                <div style={{ height: `${score * 1.6}px` }} />
                <strong>{days[index]}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="project-card">
          <span className="eyebrow">Concept mastery</span>
          <h2>Topic performance</h2>
          {mastery.map(([topic, value]) => (
            <div className="mastery-row" key={topic}>
              <strong>{topic} — {value}%</strong>
              <div className="mastery-track"><span style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </article>
      </section>

      <section className="section split">
        <article className="project-card">
          <span className="eyebrow">Topics to improve</span>
          <h2>Recommended practice</h2>
          <p>➗ Division with units — practise ferry load and irrigation timing questions.</p>
          <p>📐 Area of real spaces — repeat playground, parking and gutter-capacity stages.</p>
          <p>🧮 Formula confidence — write the formula before entering your answer.</p>
        </article>
        <article className="project-card">
          <span className="eyebrow">Badges earned</span>
          <h2>Practical builder badges</h2>
          <p>🌉 Bridge Builder — Earned</p>
          <p>🏙️ Smart City Starter — Earned</p>
          <p>💧 Water Systems Engineer — In progress</p>
          <p>🌧️ Flood-Safe Designer — Next badge</p>
        </article>
      </section>
    </PageShell>
  );
}
