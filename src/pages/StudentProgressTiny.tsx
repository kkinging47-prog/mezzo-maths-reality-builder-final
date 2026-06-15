import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const weekly = [46, 62, 58, 74, 82, 68, 90];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const mastery = [
  ['Measurement', 88, '🌉'],
  ['Area & Perimeter', 81, '📐'],
  ['Speed & Time', 73, '⛴️'],
  ['Water Flow', 69, '💧'],
  ['Data & Logic', 64, '🅿️']
] as const;
const missionTrail = [
  ['Bridge Builder', 'Complete', '100%'],
  ['Playground Designer', 'In progress', '78%'],
  ['Ferry Engineer', 'In progress', '72%'],
  ['Irrigation Designer', 'Next practice', '55%'],
  ['Parking Logic', 'Ready', '50%'],
  ['Flood-Safe Road', 'Ready', '48%']
] as const;

export default function StudentProgressTiny() {
  return (
    <PageShell>
      <main className="progress-v2">
        <section className="progress-hero-card">
          <div>
            <span className="eyebrow">My progress</span>
            <h1>Your maths adventure is growing.</h1>
            <p>Track your missions, topic mastery, badges, weekly streak, and the practical projects you are building with mathematics.</p>
            <div className="progress-actions"><Link to="/student/worlds">Continue missions</Link><Link to="/student/dashboard">Dashboard</Link></div>
          </div>
          <div className="progress-ring-card"><strong>76%</strong><span>Overall mastery</span><em>+8% this week</em></div>
        </section>

        <section className="progress-stat-grid">
          <article><span>✅</span><strong>12</strong><p>Missions completed</p></article>
          <article><span>🔥</span><strong>7 days</strong><p>Learning streak</p></article>
          <article><span>🏆</span><strong>2,450 XP</strong><p>Total score</p></article>
          <article><span>🎓</span><strong>72%</strong><p>Certificate progress</p></article>
        </section>

        <section className="progress-split">
          <article className="progress-panel">
            <div className="progress-panel-title"><span>📈</span><div><h2>Weekly learning score</h2><p>Your daily practical maths effort.</p></div></div>
            <div className="progress-bars">
              {weekly.map((score, index) => (
                <div className="progress-bar-column" key={days[index]}>
                  <div style={{ height: `${score * 1.55}px` }}><b>{score}</b></div>
                  <strong>{days[index]}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="progress-panel">
            <div className="progress-panel-title"><span>🧠</span><div><h2>Concept mastery</h2><p>Topics connected to your active projects.</p></div></div>
            {mastery.map(([topic, value, icon]) => (
              <div className="mastery-row-v2" key={topic}>
                <strong>{icon} {topic}</strong><em>{value}%</em>
                <div className="mastery-track-v2"><span style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </article>
        </section>

        <section className="progress-split">
          <article className="progress-panel">
            <div className="progress-panel-title"><span>🚀</span><div><h2>Mission trail</h2><p>See where you are across the six practical projects.</p></div></div>
            <div className="mission-trail-list">
              {missionTrail.map(([title, status, percent]) => (
                <div className="mission-trail-row" key={title}><div><strong>{title}</strong><span>{status}</span></div><em>{percent}</em></div>
              ))}
            </div>
          </article>
          <article className="progress-panel badge-panel">
            <div className="progress-panel-title"><span>🌟</span><div><h2>Badges & next steps</h2><p>Keep solving to unlock more achievements.</p></div></div>
            <div className="badge-grid"><span>🌉 Bridge Builder</span><span>🏙️ City Starter</span><span>💧 Water Engineer</span><span>🅿️ Logic Driver</span><span>⛴️ River Planner</span><span>🌧️ Flood Protector</span></div>
            <div className="practice-card"><strong>Recommended practice</strong><p>Repeat the irrigation and parking missions to improve water-flow and data-logic mastery.</p></div>
          </article>
        </section>
      </main>
      <style>{`.progress-v2{padding:2rem;color:#0f172a}.progress-hero-card{display:flex;justify-content:space-between;gap:1.5rem;align-items:stretch;border-radius:2rem;padding:2rem;background:radial-gradient(circle at 90% 10%,rgba(255,255,255,.28),transparent 14rem),linear-gradient(135deg,#2563eb,#7c3aed,#ec4899);color:white;box-shadow:0 26px 70px rgba(79,70,229,.22)}.progress-hero-card h1{font-size:clamp(2.1rem,5vw,4rem);line-height:1;margin:.6rem 0;letter-spacing:-.05em}.progress-hero-card p{max-width:760px;line-height:1.7;color:#e0e7ff}.progress-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.3rem}.progress-actions a{border-radius:999px;padding:.8rem 1.1rem;font-weight:900;text-decoration:none}.progress-actions a:first-child{background:white;color:#4f46e5}.progress-actions a:last-child{background:rgba(255,255,255,.16);color:white;border:1px solid rgba(255,255,255,.32)}.progress-ring-card{min-width:230px;display:grid;place-items:center;text-align:center;border-radius:1.6rem;padding:1.5rem;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28)}.progress-ring-card strong{width:150px;height:150px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#22c55e 0 76%,rgba(255,255,255,.25) 76% 100%);font-size:2.3rem}.progress-ring-card span,.progress-ring-card em{font-weight:900}.progress-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin:1rem 0}.progress-stat-grid article,.progress-panel{background:#fff;border:1px solid #e5e7eb;border-radius:1.4rem;box-shadow:0 20px 55px rgba(15,23,42,.08)}.progress-stat-grid article{padding:1.1rem}.progress-stat-grid span{font-size:2rem}.progress-stat-grid strong{display:block;font-size:1.75rem;color:#111827}.progress-stat-grid p{color:#64748b;margin:.2rem 0 0}.progress-split{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem}.progress-panel{padding:1.2rem}.progress-panel-title{display:flex;gap:.8rem;align-items:flex-start;margin-bottom:1rem}.progress-panel-title>span{width:3rem;height:3rem;border-radius:1rem;display:grid;place-items:center;background:#eef2ff;font-size:1.45rem}.progress-panel-title h2{margin:0;color:#111827}.progress-panel-title p{margin:.25rem 0 0;color:#64748b}.progress-bars{display:flex;gap:.65rem;align-items:end;height:170px}.progress-bar-column{display:grid;justify-items:center;gap:.45rem;flex:1}.progress-bar-column div{width:100%;max-width:48px;min-height:18px;border-radius:999px 999px 8px 8px;background:linear-gradient(180deg,#22c55e,#2563eb);display:flex;align-items:flex-start;justify-content:center;color:white;font-size:.72rem;font-weight:900;padding-top:.25rem}.progress-bar-column strong{font-size:.8rem;color:#475569}.mastery-row-v2{display:grid;grid-template-columns:1fr auto;gap:.5rem;margin:.85rem 0}.mastery-row-v2 strong{color:#111827}.mastery-row-v2 em{font-style:normal;font-weight:900;color:#7c3aed}.mastery-track-v2{grid-column:1/-1;height:.75rem;border-radius:999px;background:#e2e8f0;overflow:hidden}.mastery-track-v2 span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#22c55e,#2563eb,#a855f7)}.mission-trail-list{display:grid;gap:.65rem}.mission-trail-row{display:flex;justify-content:space-between;gap:1rem;padding:.8rem;border-radius:1rem;background:#f8fafc;border:1px solid #e5e7eb}.mission-trail-row strong{display:block;color:#111827}.mission-trail-row span{color:#64748b;font-size:.88rem}.mission-trail-row em{font-style:normal;font-weight:900;color:#16a34a}.badge-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem}.badge-grid span{border-radius:999px;background:#f8fafc;border:1px solid #e5e7eb;padding:.65rem .8rem;font-weight:900}.practice-card{margin-top:1rem;border-radius:1rem;padding:1rem;background:linear-gradient(135deg,#ecfeff,#f0fdf4);border:1px solid #bae6fd}.practice-card p{color:#475569;margin:.35rem 0 0}@media(max-width:980px){.progress-hero-card,.progress-split{grid-template-columns:1fr;display:grid}.progress-stat-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.progress-v2{padding:1rem}.progress-stat-grid,.badge-grid{grid-template-columns:1fr}.progress-ring-card{min-width:0}.progress-actions a{width:100%;text-align:center}}`}</style>
    </PageShell>
  );
}
