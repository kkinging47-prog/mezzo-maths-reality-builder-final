import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

type LeaderboardTab = 'class' | 'school' | 'district' | 'region' | 'national';

type Ranking = {
  rank: number;
  name: string;
  school: string;
  location: string;
  score: number;
  streak: string;
  badge: string;
  isCurrent?: boolean;
};

const tabs: { key: LeaderboardTab; label: string }[] = [
  { key: 'class', label: 'My Class' },
  { key: 'school', label: 'My School' },
  { key: 'district', label: 'District' },
  { key: 'region', label: 'Region' },
  { key: 'national', label: 'National' }
];

const leaderboardData: Record<LeaderboardTab, Ranking[]> = {
  class: [
    { rank: 1, name: 'Naa Ayele Aryee', school: 'Crystal Heights International School', location: 'Accra', score: 4860, streak: '18 days', badge: 'Algebra Ace' },
    { rank: 2, name: 'Kwame Boateng', school: 'Crystal Heights International School', location: 'Accra', score: 4620, streak: '14 days', badge: 'Speed Solver' },
    { rank: 3, name: 'Akosua Mensah', school: 'Crystal Heights International School', location: 'Accra', score: 4510, streak: '12 days', badge: 'Geometry Star' },
    { rank: 4, name: 'Evans Hayford (You)', school: 'Crystal Heights International School', location: 'Accra', score: 4395, streak: '9 days', badge: 'Reality Builder', isCurrent: true },
    { rank: 5, name: 'Yaw Frimpong', school: 'Crystal Heights International School', location: 'Accra', score: 4215, streak: '8 days', badge: 'Number Ninja' }
  ],
  school: [
    { rank: 1, name: 'Aisha Yakubu', school: 'Crystal Heights International School', location: 'Agbogba', score: 5120, streak: '21 days', badge: 'Maths Champion' },
    { rank: 2, name: 'Daniel Osei', school: 'Crystal Heights International School', location: 'Agbogba', score: 4960, streak: '17 days', badge: 'STEM Builder' },
    { rank: 3, name: 'Naa Ayele Aryee', school: 'Crystal Heights International School', location: 'Agbogba', score: 4860, streak: '18 days', badge: 'Algebra Ace' },
    { rank: 7, name: 'Evans Hayford (You)', school: 'Crystal Heights International School', location: 'Agbogba', score: 4395, streak: '9 days', badge: 'Reality Builder', isCurrent: true },
    { rank: 8, name: 'Mawuli Adjei', school: 'Crystal Heights International School', location: 'Agbogba', score: 4310, streak: '6 days', badge: 'Bridge Builder' }
  ],
  district: [
    { rank: 1, name: 'Sena Dorkenoo', school: 'Gold Avenue School', location: 'Ga East', score: 5580, streak: '24 days', badge: 'District Star' },
    { rank: 2, name: 'Aisha Yakubu', school: 'Crystal Heights International School', location: 'Ga East', score: 5120, streak: '21 days', badge: 'Maths Champion' },
    { rank: 3, name: 'Kobby Anane', school: 'Republic Academy', location: 'Ga East', score: 5055, streak: '19 days', badge: 'Logic Master' },
    { rank: 15, name: 'Evans Hayford (You)', school: 'Crystal Heights International School', location: 'Ga East', score: 4395, streak: '9 days', badge: 'Reality Builder', isCurrent: true },
    { rank: 16, name: 'Abigail Nortey', school: 'Abokobi Presby JHS', location: 'Ga East', score: 4315, streak: '7 days', badge: 'Accuracy Pro' }
  ],
  region: [
    { rank: 1, name: 'Kukua Amponsah', school: 'St. Peter’s Mission School', location: 'Greater Accra', score: 6125, streak: '28 days', badge: 'Regional Champion' },
    { rank: 2, name: 'Sena Dorkenoo', school: 'Gold Avenue School', location: 'Greater Accra', score: 5580, streak: '24 days', badge: 'District Star' },
    { rank: 3, name: 'Mubarak Salifu', school: 'Islamic Education Unit School', location: 'Greater Accra', score: 5440, streak: '23 days', badge: 'Mental Maths Star' },
    { rank: 42, name: 'Evans Hayford (You)', school: 'Crystal Heights International School', location: 'Greater Accra', score: 4395, streak: '9 days', badge: 'Reality Builder', isCurrent: true },
    { rank: 43, name: 'Nana Yeboah', school: 'Republic Academy', location: 'Greater Accra', score: 4370, streak: '11 days', badge: 'Problem Solver' }
  ],
  national: [
    { rank: 1, name: 'Farida Mahama', school: 'Tamale International School', location: 'Northern Region', score: 6940, streak: '34 days', badge: 'National Champion' },
    { rank: 2, name: 'Kukua Amponsah', school: 'St. Peter’s Mission School', location: 'Greater Accra', score: 6125, streak: '28 days', badge: 'Regional Champion' },
    { rank: 3, name: 'Kojo Antwi', school: 'Prempeh Basic School', location: 'Ashanti Region', score: 6010, streak: '27 days', badge: 'Maths Genius' },
    { rank: 188, name: 'Evans Hayford (You)', school: 'Crystal Heights International School', location: 'Greater Accra', score: 4395, streak: '9 days', badge: 'Reality Builder', isCurrent: true },
    { rank: 189, name: 'Elsie Mensima', school: 'Cape Coast Model School', location: 'Central Region', score: 4380, streak: '8 days', badge: 'Fast Finisher' }
  ]
};

const medal = ['🥇', '🥈', '🥉'];

export default function StudentLeaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('class');
  const rankings = leaderboardData[activeTab];
  const topThree = useMemo(() => rankings.slice(0, 3), [rankings]);

  return (
    <PageShell>
      <style>{`
        .leaderboard-page { color: #0f172a; }
        .leaderboard-page .section { max-width: 1220px; }
        .leaderboard-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) auto;
          gap: 1.2rem;
          align-items: center;
          border-radius: 2rem;
          padding: clamp(1.35rem, 3vw, 2.35rem);
          background:
            radial-gradient(circle at 88% 14%, rgba(37, 99, 235, .2), transparent 15rem),
            linear-gradient(135deg, #ffffff 0%, #f4f0ff 45%, #eef7ff 100%);
          border: 1px solid rgba(124, 58, 237, .14);
          box-shadow: 0 26px 70px rgba(76, 29, 149, .12);
        }
        .leaderboard-hero h1 {
          margin: .35rem 0 .75rem;
          color: #111827;
          font-size: clamp(2.2rem, 4vw, 3.6rem);
          line-height: 1.02;
          letter-spacing: -.05em;
        }
        .leaderboard-hero p { color: #64748b; max-width: 44rem; }
        .leaderboard-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.25rem; }
        .leaderboard-hero-badge {
          min-width: min(100%, 260px);
          display: grid;
          gap: .65rem;
          padding: 1.1rem;
          border-radius: 1.4rem;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(124, 58, 237, .16);
          box-shadow: 0 18px 45px rgba(15, 23, 42, .08);
        }
        .leaderboard-hero-badge strong { font-size: 2rem; letter-spacing: -.04em; }
        .leaderboard-tabs {
          display: flex;
          gap: .65rem;
          flex-wrap: wrap;
          margin-top: 1.2rem;
          padding: .65rem;
          border-radius: 1.3rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 16px 40px rgba(15, 23, 42, .06);
        }
        .leaderboard-tab {
          border: 0;
          border-radius: 999px;
          padding: .78rem 1rem;
          font-weight: 900;
          color: #475569;
          background: #f8fafc;
          cursor: pointer;
        }
        .leaderboard-tab.active {
          color: #ffffff;
          background: linear-gradient(135deg, #2563eb, #9333ea);
          box-shadow: 0 12px 28px rgba(79, 70, 229, .25);
        }
        .champion-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .champion-card {
          position: relative;
          overflow: hidden;
          min-height: 14rem;
          border-radius: 1.55rem;
          padding: 1.15rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 55px rgba(15, 23, 42, .08);
        }
        .champion-card.first {
          transform: translateY(-.35rem);
          border-color: rgba(245, 158, 11, .42);
          background: linear-gradient(135deg, #fffbeb, #ffffff 48%, #f5f3ff);
        }
        .champion-card::after {
          content: '';
          position: absolute;
          inset: auto -2rem -3rem auto;
          width: 9rem;
          height: 9rem;
          border-radius: 999px;
          background: rgba(147, 51, 234, .1);
        }
        .champion-medal { font-size: 2.8rem; }
        .champion-card h3 { margin: .7rem 0 .25rem; color: #111827; }
        .champion-card p { margin: 0; color: #64748b; }
        .champion-score { margin-top: .85rem; display: flex; justify-content: space-between; gap: .7rem; align-items: center; }
        .score-pill, .badge-pill {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: .45rem .7rem;
          font-weight: 900;
          font-size: .88rem;
        }
        .score-pill { color: #1d4ed8; background: #dbeafe; }
        .badge-pill { color: #7e22ce; background: #f3e8ff; }
        .leaderboard-card {
          border-radius: 1.45rem;
          padding: 1.1rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 20px 55px rgba(15, 23, 42, .08);
        }
        .leaderboard-card h2, .leaderboard-card h3 { margin: 0 0 .45rem; color: #111827; }
        .table-wrap { overflow-x: auto; margin-top: 1rem; }
        .leaderboard-table { width: 100%; border-collapse: collapse; min-width: 820px; }
        .leaderboard-table th {
          text-align: left;
          color: #64748b;
          font-size: .78rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          padding: .85rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .leaderboard-table td {
          padding: .95rem .85rem;
          border-bottom: 1px solid #eef2f7;
          color: #334155;
          font-weight: 750;
        }
        .leaderboard-table tr.current-row td {
          background: linear-gradient(90deg, rgba(219, 234, 254, .9), rgba(243, 232, 255, .8));
          color: #1e1b4b;
        }
        .student-cell strong { display: block; color: #111827; }
        .student-cell span { color: #64748b; font-size: .88rem; }
        .guide-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1rem;
        }
        .guide-card {
          border-radius: 1.3rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 45px rgba(15, 23, 42, .06);
          padding: 1rem;
        }
        .guide-card span { font-size: 2rem; }
        .guide-card ul { padding-left: 1.1rem; margin-bottom: 0; color: #64748b; font-weight: 700; }
        @media(max-width: 980px) {
          .leaderboard-hero { grid-template-columns: 1fr; }
          .champion-grid, .guide-grid { grid-template-columns: 1fr; }
          .champion-card.first { transform: none; }
        }
        @media(max-width: 640px) {
          .leaderboard-tabs { display: grid; grid-template-columns: 1fr 1fr; }
          .leaderboard-tab { width: 100%; }
        }
      `}</style>

      <div className="leaderboard-page">
        <section className="section leaderboard-hero">
          <div>
            <span className="eyebrow">Student leaderboard</span>
            <h1>Mezzo Maths Champions</h1>
            <p>Track your ranking across your class, school, district, region, and Ghana.</p>
            <p>Compete fairly, improve daily, and celebrate mathematical excellence.</p>
            <div className="leaderboard-actions">
              <Link className="btn btn-primary" to="/student/worlds">Take Today’s Challenge</Link>
              <Link className="btn btn-secondary" to="/student/progress">View My Progress</Link>
            </div>
          </div>
          <aside className="leaderboard-hero-badge" aria-label="Your leaderboard summary">
            <span className="eyebrow">Your current class rank</span>
            <strong>4th</strong>
            <p>Keep your daily streak alive to enter the top 3 this week.</p>
          </aside>
        </section>

        <section className="section">
          <div className="leaderboard-tabs" aria-label="Leaderboard scope tabs">
            {tabs.map((tab) => (
              <button
                className={`leaderboard-tab${activeTab === tab.key ? ' active' : ''}`}
                key={tab.key}
                type="button"
                aria-pressed={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="section champion-grid" aria-label="Top three champions">
          {topThree.map((student, index) => (
            <article className={`champion-card${index === 0 ? ' first' : ''}`} key={`${activeTab}-${student.rank}`}>
              <div className="champion-medal" aria-hidden="true">{medal[index]}</div>
              <span className="eyebrow">Rank {student.rank}</span>
              <h3>{student.name}</h3>
              <p>{student.school}</p>
              <div className="champion-score">
                <span className="score-pill">{student.score.toLocaleString()} pts</span>
                <span className="badge-pill">{student.badge}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="section leaderboard-card">
          <span className="eyebrow">{tabs.find((tab) => tab.key === activeTab)?.label} ranking</span>
          <h2>Full leaderboard</h2>
          <p>Scores reflect completed challenges, accuracy, consistency and current streak.</p>
          <div className="table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>School</th>
                  <th>Location</th>
                  <th>Score</th>
                  <th>Streak</th>
                  <th>Badge</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((student) => (
                  <tr className={student.isCurrent ? 'current-row' : undefined} key={`${activeTab}-${student.rank}-${student.name}`}>
                    <td>#{student.rank}</td>
                    <td className="student-cell">
                      <strong>{student.name}</strong>
                      {student.isCurrent && <span>Current learner</span>}
                    </td>
                    <td>{student.school}</td>
                    <td>{student.location}</td>
                    <td>{student.score.toLocaleString()}</td>
                    <td>{student.streak}</td>
                    <td>{student.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="section guide-grid">
          <article className="guide-card">
            <span aria-hidden="true">🚀</span>
            <h3>How to climb the leaderboard</h3>
            <ul>
              <li>Complete missions</li>
              <li>Improve accuracy</li>
              <li>Keep a daily streak</li>
            </ul>
          </article>
          <article className="guide-card">
            <span aria-hidden="true">🤝</span>
            <h3>Fair Play Rules</h3>
            <ul>
              <li>No cheating</li>
              <li>Scores are based on completed challenges</li>
              <li>Accuracy and consistency matter</li>
            </ul>
          </article>
          <article className="guide-card">
            <span aria-hidden="true">⭐</span>
            <h3>Next Reward</h3>
            <ul>
              <li>Top 10 this week earns a Mezzo Maths Star Badge</li>
              <li>Top 3 unlock special recognition</li>
            </ul>
          </article>
        </section>
      </div>
    </PageShell>
  );
}
