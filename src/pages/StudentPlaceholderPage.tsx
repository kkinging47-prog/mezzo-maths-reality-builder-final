import { Link } from 'react-router-dom';

type PlaceholderMode = 'worlds' | 'missions' | 'equation-builder';

type Card = {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

type PageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryTo: string;
  cards: Card[];
};

const pageCopy: Record<PlaceholderMode, PageCopy> = {
  worlds: {
    eyebrow: 'Maths worlds',
    title: 'Maths Worlds',
    description: 'Choose a practical maths world and continue building real-life projects with your maths skills.',
    primaryLabel: 'Continue latest mission',
    primaryTo: '/student/project/flood-safe-road-drainage-upgrade',
    secondaryLabel: 'View my progress',
    secondaryTo: '/student/progress',
    cards: [
      {
        icon: '🏙️',
        title: 'Smart City Designer',
        description: 'Use area, perimeter, measurement, and planning to design safe city systems.',
        actionLabel: 'Open playground mission',
        actionTo: '/student/project/school-playground-layout',
      },
      {
        icon: '🌾',
        title: 'Farm & Market Maths',
        description: 'Solve water, farming, quantity, cost, and market problems from real life.',
        actionLabel: 'Open irrigation mission',
        actionTo: '/student/project/smart-irrigation-system',
      },
      {
        icon: '⛴️',
        title: 'Transport & Engineering',
        description: 'Build ferries, bridges, and transport systems using practical maths.',
        actionLabel: 'Open ferry mission',
        actionTo: '/student/project/ferry-river-crossing',
      },
      {
        icon: '🌧️',
        title: 'Flood-Safe Road Engineering Lab',
        description: 'Protect communities by using maths to improve roads, gutters, and drainage.',
        actionLabel: 'Open drainage mission',
        actionTo: '/student/project/flood-safe-road-drainage-upgrade',
      },
    ],
  },
  missions: {
    eyebrow: 'Mission centre',
    title: 'My Missions',
    description: 'Continue active missions, review completed challenges, and keep building your STEM portfolio.',
    primaryLabel: 'Resume active mission',
    primaryTo: '/student/project/flood-safe-road-drainage-upgrade',
    secondaryLabel: 'See leaderboard',
    secondaryTo: '/student/leaderboard',
    cards: [
      {
        icon: '🌧️',
        title: 'Flood-Safe Road Drainage Upgrade',
        description: 'Raise a flood-prone road and build deeper side gutters to protect homes.',
        actionLabel: 'Resume',
        actionTo: '/student/project/flood-safe-road-drainage-upgrade',
      },
      {
        icon: '🅿️',
        title: 'Smart Parking System',
        description: 'Use arrays, subtraction, and sensors to guide cars into available spaces.',
        actionLabel: 'Open mission',
        actionTo: '/student/project/smart-car-parking-system',
      },
      {
        icon: '🛝',
        title: 'Build a Safe School Playground',
        description: 'Measure a school compound, plan safe zones, and install play equipment.',
        actionLabel: 'Open mission',
        actionTo: '/student/project/school-playground-layout',
      },
      {
        icon: '⛴️',
        title: 'Ferry River Crossing',
        description: 'Plan a safe ferry system for a community separated by a river.',
        actionLabel: 'Open mission',
        actionTo: '/student/project/ferry-river-crossing',
      },
    ],
  },
  'equation-builder': {
    eyebrow: 'Equation studio',
    title: 'Equation Builder',
    description: 'Turn real-life problems into simple maths equations before you solve them.',
    primaryLabel: 'Try a mission',
    primaryTo: '/student/project/smart-car-parking-system',
    secondaryLabel: 'View progress',
    secondaryTo: '/student/progress',
    cards: [
      {
        icon: '📐',
        title: 'Area = length × width',
        description: 'Use this when measuring playgrounds, farms, rooms, roads, and building spaces.',
      },
      {
        icon: '🛒',
        title: 'Total cost = price × quantity',
        description: 'Use this for market maths, supplies, school materials, and project budgets.',
      },
      {
        icon: '🚗',
        title: 'Speed = distance ÷ time',
        description: 'Use this for transport, ferry movement, traffic systems, and STEM challenges.',
      },
    ],
  },
};

export default function StudentPlaceholderPage({ mode }: { mode: PlaceholderMode }) {
  const page = pageCopy[mode];

  return (
    <main className="student-placeholder-page">
      <section className="student-placeholder-hero">
        <span>{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
        <div className="student-placeholder-actions">
          <Link to={page.primaryTo}>{page.primaryLabel}</Link>
          <Link to={page.secondaryTo}>{page.secondaryLabel}</Link>
        </div>
      </section>

      <section className="student-placeholder-grid" aria-label={`${page.title} preview cards`}>
        {page.cards.map((card) => (
          <article className="student-placeholder-card" key={card.title}>
            <div className="student-placeholder-icon" aria-hidden="true">{card.icon}</div>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            {card.actionTo && card.actionLabel ? <Link to={card.actionTo}>{card.actionLabel}</Link> : null}
          </article>
        ))}
      </section>

      <style>{`
        .student-placeholder-page{min-height:100vh;padding:2rem;background:linear-gradient(135deg,#eef2ff 0%,#f8fafc 46%,#eff6ff 100%);color:#172554}.student-placeholder-hero{border-radius:2rem;padding:2rem;background:linear-gradient(135deg,#4f46e5,#7c3aed,#2563eb);color:white;box-shadow:0 24px 60px rgba(79,70,229,.22)}.student-placeholder-hero span{display:inline-flex;font-weight:900;text-transform:uppercase;letter-spacing:.12em;font-size:.76rem;background:rgba(255,255,255,.16);padding:.45rem .75rem;border-radius:999px}.student-placeholder-hero h1{font-size:clamp(2rem,4vw,3.35rem);line-height:1;margin:1rem 0 .75rem}.student-placeholder-hero p{max-width:780px;font-size:1.05rem;line-height:1.7;color:#e0e7ff}.student-placeholder-actions{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.4rem}.student-placeholder-actions a,.student-placeholder-card a{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.75rem 1rem;font-weight:900;text-decoration:none}.student-placeholder-actions a:first-child{background:white;color:#4f46e5}.student-placeholder-actions a:last-child{background:rgba(255,255,255,.16);color:white;border:1px solid rgba(255,255,255,.32)}.student-placeholder-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-top:1.2rem}.student-placeholder-card{background:rgba(255,255,255,.92);border:1px solid rgba(148,163,184,.2);border-radius:1.4rem;padding:1.25rem;box-shadow:0 18px 45px rgba(15,23,42,.08)}.student-placeholder-icon{width:3rem;height:3rem;border-radius:1rem;display:grid;place-items:center;background:#eef2ff;font-size:1.45rem;margin-bottom:.8rem}.student-placeholder-card h2{font-size:1.04rem;margin:0 0 .5rem;color:#1e1b4b}.student-placeholder-card p{font-size:.92rem;line-height:1.55;color:#475569}.student-placeholder-card a{margin-top:.6rem;background:#eef2ff;color:#4f46e5;font-size:.9rem}@media(max-width:1080px){.student-placeholder-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.student-placeholder-page{padding:1rem}.student-placeholder-grid{grid-template-columns:1fr}.student-placeholder-hero{padding:1.35rem}.student-placeholder-actions a{width:100%}}`}</style>
    </main>
  );
}
