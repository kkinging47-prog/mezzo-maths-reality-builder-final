import { Link } from 'react-router-dom';
import { projects } from '../data/projects';

type MissionMode = 'Beginner' | 'Intermediate' | 'Advanced';

type MissionCard = {
  title: string;
  world: string;
  topic: string;
  maths: string[];
  outcome: string;
  projectId?: string;
};

const activeProjectMap = projects.reduce<Record<string, string>>((acc, project) => {
  acc[project.title] = project.id;
  return acc;
}, {});

const missionModes: Record<MissionMode, MissionCard[]> = {
  Beginner: [
    {
      title: 'Build a Footbridge Over a Stream',
      world: 'Bridge Builder World',
      topic: 'Measurement and addition',
      maths: ['Length', 'Addition', 'Multiplication', 'Load capacity'],
      outcome: 'Measure a stream, count planks, add supports, and test a safe bridge.',
      projectId: activeProjectMap['Build a Footbridge Over a Stream'],
    },
    {
      title: 'Build a Safe School Playground',
      world: 'Smart City Designer',
      topic: 'Area and perimeter',
      maths: ['Area', 'Perimeter', 'Division', 'Safety spacing'],
      outcome: 'Turn an empty school compound into a safe playground with mats, swings, slides, and fencing.',
      projectId: activeProjectMap['Build a Safe School Playground'],
    },
    {
      title: 'Build a Ferry for River Crossing',
      world: 'Ship Engineering Bay',
      topic: 'Capacity and counting',
      maths: ['Measurement', 'Area', 'Multiplication', 'Division'],
      outcome: 'Design a ferry platform, seats, rails, and load limit for safe crossing.',
      projectId: activeProjectMap['Build a Ferry for River Crossing'],
    },
    {
      title: 'Build a Smart Irrigation System',
      world: 'Farm & Market Maths',
      topic: 'Area, percentages, and time',
      maths: ['Area', 'Percentages', 'Water flow', 'Time'],
      outcome: 'Plan garden beds, pipes, sprinklers, and watering time for a school farm.',
      projectId: activeProjectMap['Build a Smart Irrigation System'],
    },
    {
      title: 'Build a Smart Car Parking System',
      world: 'Smart Parking System Lab',
      topic: 'Arrays and subtraction',
      maths: ['Arrays', 'Counting', 'Subtraction', 'Sensors'],
      outcome: 'Create parking spaces, sensors, entry signs, and free-space display logic.',
      projectId: activeProjectMap['Build a Smart Car Parking System'],
    },
    {
      title: 'Raise the Road and Upgrade the Gutters',
      world: 'Flood-Safe Road Engineering Lab',
      topic: 'Measurement and area',
      maths: ['Subtraction', 'Area', 'Multiplication', 'Drainage'],
      outcome: 'Raise a road, widen gutters, and test rainwater flow safely away from homes.',
      projectId: activeProjectMap['Raise the Road and Upgrade the Gutters'],
    },
    {
      title: 'Design a Football Field Layout',
      world: 'Sports Geometry Lab',
      topic: 'Perimeter and scale drawing',
      maths: ['Length', 'Width', 'Perimeter', 'Scale'],
      outcome: 'Mark a football pitch, centre circle, goal areas, and boundary lines.',
    },
    {
      title: 'Build a Water Tank for a School',
      world: 'Water & Sanitation Lab',
      topic: 'Volume and capacity',
      maths: ['Volume', 'Capacity', 'Units', 'Division'],
      outcome: 'Choose tank dimensions and estimate how many pupils can be served.',
    },
    {
      title: 'Plan a Classroom Seating Layout',
      world: 'Classroom Design Studio',
      topic: 'Rows, columns, and space',
      maths: ['Arrays', 'Multiplication', 'Area', 'Spacing'],
      outcome: 'Arrange desks so learners can move safely and the teacher can reach everyone.',
    },
    {
      title: 'Set Up a Market Stall',
      world: 'Market Maths',
      topic: 'Money and simple profit',
      maths: ['Addition', 'Subtraction', 'Unit price', 'Profit'],
      outcome: 'Build a stall, price goods, count sales, and calculate profit.',
    },
  ],
  Intermediate: [
    {
      title: 'Design a Scale Model School Block',
      world: 'Architect Studio',
      topic: 'Ratio and scale drawing',
      maths: ['Ratio', 'Scale', 'Similar shapes', 'Measurement'],
      outcome: 'Convert real measurements into a smaller model and check the building plan.',
    },
    {
      title: 'Build a Bridge Truss with Angles',
      world: 'Bridge Builder World',
      topic: 'Angles and triangles',
      maths: ['Angles', 'Triangles', 'Symmetry', 'Strength'],
      outcome: 'Use triangle braces to strengthen a bridge and keep its frame balanced.',
    },
    {
      title: 'Create a School Attendance Dashboard',
      world: 'Data & Statistics Lab',
      topic: 'Statistics and charts',
      maths: ['Frequency tables', 'Bar charts', 'Mean', 'Percentages'],
      outcome: 'Turn class attendance data into useful charts for a headteacher.',
    },
    {
      title: 'Plan a Delivery Route for a Shop',
      world: 'Transport Planning Lab',
      topic: 'Speed, distance, and time',
      maths: ['Speed', 'Distance', 'Time', 'Unit conversion'],
      outcome: 'Calculate travel time and organise deliveries to different communities.',
    },
    {
      title: 'Mix Concrete for a School Walkway',
      world: 'Construction Maths Lab',
      topic: 'Ratio and proportion',
      maths: ['Ratio', 'Proportion', 'Volume', 'Multiplication'],
      outcome: 'Mix sand, cement, and stones in the right ratio for a strong walkway.',
    },
    {
      title: 'Paint a Classroom Block',
      world: 'Surface Area Studio',
      topic: 'Surface area and cost',
      maths: ['Area', 'Surface area', 'Cost', 'Estimation'],
      outcome: 'Calculate paint needed and estimate cost before painting school walls.',
    },
    {
      title: 'Program a Robot Maze Route',
      world: 'Robotics Arena',
      topic: 'Coordinates and sequences',
      maths: ['Coordinates', 'Sequences', 'Directions', 'Transformations'],
      outcome: 'Use coordinate instructions to move a robot around obstacles.',
    },
    {
      title: 'Build a Fair Game Booth',
      world: 'Probability Arcade',
      topic: 'Probability',
      maths: ['Probability', 'Fractions', 'Expected outcomes', 'Percentages'],
      outcome: 'Design a fair school funfair game and test chances of winning.',
    },
    {
      title: 'Plan a School Garden Harvest',
      world: 'Farm & Market Maths',
      topic: 'Fractions and percentages',
      maths: ['Fractions', 'Percentages', 'Ratio', 'Data'],
      outcome: 'Divide land for crops and estimate harvest quantities for the market.',
    },
    {
      title: 'Map a Community Water Pipeline',
      world: 'Water Engineering Lab',
      topic: 'Bearings and measurement',
      maths: ['Bearings', 'Distance', 'Scale', 'Angles'],
      outcome: 'Use map directions to plan a pipe route from a water tank to homes.',
    },
  ],
  Advanced: [
    {
      title: 'Design a Flood-Resistant Drainage Network',
      world: 'Civil Engineering Lab',
      topic: 'Gradient, volume, and flow',
      maths: ['Gradient', 'Volume', 'Area', 'Rate of flow'],
      outcome: 'Design connected drains that can handle heavy rainfall without flooding roads.',
    },
    {
      title: 'Launch a Water Rocket Safely',
      world: 'Rocket Science Lab',
      topic: 'Quadratic patterns and motion',
      maths: ['Graphs', 'Time', 'Height', 'Quadratic patterns'],
      outcome: 'Model how launch angle and time affect rocket height and landing point.',
    },
    {
      title: 'Estimate the Height of a School Tower',
      world: 'Trigonometry Field Lab',
      topic: 'Trigonometry',
      maths: ['Angles of elevation', 'Right triangles', 'Scale', 'Estimation'],
      outcome: 'Use a measured distance and angle to estimate the height of a tower.',
    },
    {
      title: 'Optimise a Farm Land Plan',
      world: 'Agribusiness Lab',
      topic: 'Linear inequalities',
      maths: ['Inequalities', 'Area', 'Profit', 'Constraints'],
      outcome: 'Decide how much land to use for each crop when land and money are limited.',
    },
    {
      title: 'Build a Multi-Tank Water System',
      world: 'Water & Sanitation Lab',
      topic: 'Compound volume',
      maths: ['Volume', 'Capacity', 'Rates', 'Conversion'],
      outcome: 'Connect tanks, calculate capacity, and estimate refill time for a school.',
    },
    {
      title: 'Create a School Savings Plan',
      world: 'Financial Maths Lab',
      topic: 'Simple and compound interest',
      maths: ['Interest', 'Percentages', 'Growth', 'Money'],
      outcome: 'Compare saving options and predict how school project funds can grow.',
    },
    {
      title: 'Analyse BECE-Style Performance Data',
      world: 'Data Science Lab',
      topic: 'Data analysis',
      maths: ['Mean', 'Median', 'Range', 'Graphs', 'Inference'],
      outcome: 'Use test results to find strengths, weak areas, and improvement targets.',
    },
    {
      title: 'Design a Solar Panel Power Layout',
      world: 'Renewable Energy Lab',
      topic: 'Direct proportion and rate',
      maths: ['Ratio', 'Rate', 'Power', 'Area'],
      outcome: 'Choose panel positions and estimate power generation for a school block.',
    },
    {
      title: 'Build a Stadium Seating Plan',
      world: 'Sports Engineering Lab',
      topic: 'Sequences and capacity',
      maths: ['Sequences', 'Rows', 'Capacity', 'Arithmetic patterns'],
      outcome: 'Use number patterns to design seating sections and estimate total capacity.',
    },
    {
      title: 'Plan a Community Health Centre',
      world: 'Architect Studio',
      topic: 'Scale, area, and cost',
      maths: ['Scale drawing', 'Area', 'Budgeting', 'Estimation'],
      outcome: 'Create a scaled building plan and estimate construction material costs.',
    },
  ],
};

const modeDescriptions: Record<MissionMode, string> = {
  Beginner: 'Start with practical JHS foundations: measurement, area, perimeter, fractions, counting, and simple equations.',
  Intermediate: 'Grow into deeper problem solving: ratio, proportion, statistics, probability, coordinates, sequences, and speed.',
  Advanced: 'Take on bigger real-world challenges using trigonometry, graphs, volume, inequalities, rates, and data analysis.',
};

const modeColours: Record<MissionMode, string> = {
  Beginner: '#2563eb',
  Intermediate: '#a21caf',
  Advanced: '#f97316',
};

function MissionModeSection({ mode, missions }: { mode: MissionMode; missions: MissionCard[] }) {
  return (
    <section className="mode-section" id={`${mode.toLowerCase()}-mode`}>
      <div className="mode-section-heading">
        <span className="mode-pill" style={{ background: modeColours[mode] }}>{mode} Mode</span>
        <div>
          <h2>{mode} Missions</h2>
          <p>{modeDescriptions[mode]}</p>
        </div>
      </div>

      <div className="mode-mission-grid">
        {missions.map((mission) => {
          const isLive = Boolean(mission.projectId);
          return (
            <article className={`mode-mission-card ${isLive ? 'live' : 'soon'}`} key={`${mode}-${mission.title}`}>
              <div className="mode-card-top">
                <span>{mission.world}</span>
                <strong>{mission.topic}</strong>
              </div>
              <h3>{mission.title}</h3>
              <p>{mission.outcome}</p>
              <div className="mode-chip-row">
                {mission.maths.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
              </div>
              {isLive ? (
                <Link to={`/student/project/${mission.projectId}`} className="mission-start-btn">Start Mission →</Link>
              ) : (
                <button className="mission-start-btn mission-soon-btn" type="button" disabled>Coming Soon</button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function StudentWorldsPage() {
  return (
    <main className="student-worlds-clean world-modes-page">
      <style>{`
        .world-modes-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #eef6ff 0%, #f7f1ff 52%, #fff7ed 100%);
          color: #172033;
        }
        .student-worlds-topbar {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: 1rem clamp(1rem, 3vw, 2rem);
          background: rgba(255,255,255,.92);
          border-bottom: 1px solid #dbe4f0;
          box-shadow: 0 10px 24px rgba(15,23,42,.08);
          position: sticky;
          top: 0;
          z-index: 5;
          backdrop-filter: blur(14px);
        }
        .student-worlds-back {
          display: grid;
          place-items: center;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 999px;
          background: #f1f5f9;
          color: #172033;
          font-weight: 900;
        }
        .student-worlds-topbar h1 { margin: 0; font-size: clamp(1.2rem, 2vw, 1.65rem); }
        .student-worlds-topbar p { margin: .15rem 0 0; color: #475569; }
        .student-worlds-topbar nav { display: flex; gap: .6rem; flex-wrap: wrap; }
        .student-worlds-topbar nav a {
          padding: .65rem 1rem;
          border-radius: .85rem;
          color: white;
          font-weight: 900;
          background: linear-gradient(135deg, #2d7bf4, #8b5cf6);
        }
        .student-worlds-topbar nav a:last-child { background: #ef233c; }
        .student-worlds-wrap {
          max-width: 1350px;
          margin: 0 auto;
          padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem);
        }
        .worlds-hero-card {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr);
          gap: 1.5rem;
          align-items: center;
          padding: clamp(1.4rem, 4vw, 2.4rem);
          border-radius: 2rem;
          background: linear-gradient(135deg, #2563eb 0%, #9b00e8 52%, #00a86b 100%);
          color: white;
          box-shadow: 0 24px 55px rgba(79,70,229,.24);
          overflow: hidden;
          position: relative;
        }
        .worlds-hero-card::after {
          content: '';
          position: absolute;
          width: 16rem;
          height: 16rem;
          right: -5rem;
          top: -5rem;
          border-radius: 999px;
          background: rgba(255,255,255,.14);
        }
        .worlds-eyebrow {
          display: inline-flex;
          padding: .42rem .85rem;
          border-radius: 999px;
          background: rgba(255,255,255,.18);
          font-weight: 900;
          margin-bottom: .85rem;
        }
        .worlds-hero-card h2 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 4rem);
          line-height: .98;
          letter-spacing: -.04em;
        }
        .worlds-hero-card p {
          margin: 1rem 0 0;
          color: rgba(255,255,255,.94);
          max-width: 56rem;
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: 1.55;
        }
        .mode-jump-panel {
          display: grid;
          gap: .75rem;
          padding: 1rem;
          border-radius: 1.4rem;
          background: rgba(255,255,255,.16);
          border: 1px solid rgba(255,255,255,.22);
          z-index: 1;
        }
        .mode-jump-panel a {
          padding: .9rem 1rem;
          border-radius: 1rem;
          background: white;
          color: #172033;
          font-weight: 900;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mode-section { padding-top: 2.2rem; }
        .mode-section-heading {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin: 0 0 1.2rem;
        }
        .mode-pill {
          color: white;
          padding: .55rem .9rem;
          border-radius: 999px;
          font-weight: 950;
          white-space: nowrap;
          box-shadow: 0 12px 24px rgba(15,23,42,.15);
        }
        .mode-section-heading h2 {
          margin: 0;
          font-size: clamp(1.65rem, 3vw, 2.35rem);
          letter-spacing: -.035em;
        }
        .mode-section-heading p {
          margin: .25rem 0 0;
          color: #475569;
          max-width: 62rem;
          line-height: 1.55;
        }
        .mode-mission-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }
        .mode-mission-card {
          display: grid;
          gap: .75rem;
          padding: 1.25rem;
          border-radius: 1.25rem;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(148,163,184,.22);
          box-shadow: 0 18px 34px rgba(15,23,42,.11);
          min-height: 295px;
        }
        .mode-mission-card.live {
          border-color: rgba(37,99,235,.28);
          box-shadow: 0 22px 40px rgba(37,99,235,.14);
        }
        .mode-card-top {
          display: flex;
          justify-content: space-between;
          gap: .65rem;
          color: #64748b;
          font-size: .85rem;
          font-weight: 850;
        }
        .mode-card-top strong {
          color: #7c3aed;
          text-align: right;
        }
        .mode-mission-card h3 {
          margin: 0;
          font-size: 1.18rem;
          color: #0f172a;
        }
        .mode-mission-card p {
          margin: 0;
          color: #475569;
          line-height: 1.5;
        }
        .mode-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: .45rem;
          margin-top: auto;
        }
        .mode-chip-row span {
          padding: .35rem .6rem;
          border-radius: 999px;
          background: #eef4ff;
          color: #334155;
          font-size: .78rem;
          font-weight: 800;
        }
        .mission-soon-btn {
          opacity: .62;
          cursor: not-allowed;
          border: 0;
        }
        @media (max-width: 1080px) {
          .worlds-hero-card,
          .mode-mission-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 760px) {
          .student-worlds-topbar,
          .worlds-hero-card,
          .mode-mission-grid {
            grid-template-columns: 1fr;
          }
          .student-worlds-topbar nav { justify-content: flex-start; }
          .mode-section-heading { flex-direction: column; }
        }
      `}</style>

      <section className="student-worlds-topbar">
        <Link to="/student/dashboard" className="student-worlds-back" aria-label="Back to dashboard">←</Link>
        <div>
          <h1>Maths World Adventure</h1>
          <p>Choose your level. Build real things with JHS mathematics.</p>
        </div>
        <nav>
          <Link to="/student/dashboard">Dashboard</Link>
          <Link to="/">Logout</Link>
        </nav>
      </section>

      <section className="student-worlds-wrap">
        <div className="worlds-hero-card">
          <div>
            <span className="worlds-eyebrow">Beginner • Intermediate • Advanced</span>
            <h2>Mission Modes for Every Maths Builder</h2>
            <p>
              Start with measurement and area, grow into ratio, statistics and coordinates, then advance into trigonometry,
              graphs, rates and real engineering decisions. Each mission turns a JHS mathematics topic into something learners can build.
            </p>
          </div>
          <div className="mode-jump-panel" aria-label="Mission mode quick links">
            <a href="#beginner-mode">Beginner Mode <span>Foundations →</span></a>
            <a href="#intermediate-mode">Intermediate Mode <span>Problem solving →</span></a>
            <a href="#advanced-mode">Advanced Mode <span>Engineering →</span></a>
          </div>
        </div>

        {(Object.keys(missionModes) as MissionMode[]).map((mode) => (
          <MissionModeSection key={mode} mode={mode} missions={missionModes[mode]} />
        ))}
      </section>
    </main>
  );
}
