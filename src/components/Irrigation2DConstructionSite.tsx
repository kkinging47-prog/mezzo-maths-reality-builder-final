import { useState } from 'react';

type Irrigation2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const rowYs = [236, 278, 320, 362];
const sprinklerPoints = [
  { x: 374, y: 236 },
  { x: 566, y: 236 },
  { x: 374, y: 278 },
  { x: 566, y: 278 },
  { x: 374, y: 320 },
  { x: 566, y: 320 },
  { x: 374, y: 362 },
  { x: 566, y: 362 }
];

const encouragement = [
  'Answer the first maths question to begin planning the smart irrigation system.',
  'Great measuring! The garden bed is marked and ready for irrigation.',
  'Correct! A soil moisture sensor now detects dry soil.',
  'Excellent! The water tank is sized for the garden.',
  'Well done! Pipes now carry water to each garden row.',
  'Great work! Sprinklers are installed across the rows.',
  'System complete. Click Test Irrigation to water the garden automatically.'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

function House({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g filter="url(#softShadow)">
      <rect x={x} y={y} width="82" height="58" rx="7" fill={color} stroke="#92400e" strokeWidth="3" />
      <path d={`M${x - 10} ${y + 4} L${x + 41} ${y - 32} L${x + 92} ${y + 4} Z`} fill="#b45309" />
      <rect x={x + 33} y={y + 24} width="18" height="34" rx="3" fill="#78350f" />
      <rect x={x + 12} y={y + 16} width="17" height="16" rx="2" fill="#bfdbfe" />
      <rect x={x + 55} y={y + 16} width="17" height="16" rx="2" fill="#bfdbfe" />
    </g>
  );
}

function Plant({ x, y, watered }: { x: number; y: number; watered: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y} C${x - 8} ${y - 22} ${x - 20} ${y - 32} ${x - 34} ${y - 38}`} stroke={watered ? '#166534' : '#854d0e'} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d={`M${x} ${y} C${x + 8} ${y - 24} ${x + 24} ${y - 34} ${x + 38} ${y - 40}`} stroke={watered ? '#16a34a' : '#a16207'} strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx={x - 34} cy={y - 38} rx="13" ry="8" fill={watered ? '#22c55e' : '#b45309'} transform={`rotate(-18 ${x - 34} ${y - 38})`} />
      <ellipse cx={x + 38} cy={y - 40} rx="13" ry="8" fill={watered ? '#4ade80' : '#ca8a04'} transform={`rotate(18 ${x + 38} ${y - 40})`} />
      <ellipse cx={x} cy={y + 3} rx="42" ry="8" fill="#7c2d12" opacity=".22" />
    </g>
  );
}

export default function Irrigation2DConstructionSite({ buildStage, feedback }: Irrigation2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);
  const watered = testing && stage >= 6;
  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : encouragement[stage];

  return (
    <div className="irrigation-site" aria-label={`Smart irrigation construction site stage ${stage} of 6`}>
      <div className="irrigation-site__header">
        <div>
          <p className="irrigation-site__eyebrow">Farm & Market Maths</p>
          <h2>Smart Irrigation System</h2>
          <p>{visibleFeedback}</p>
        </div>
        <div className="irrigation-site__status">Stage {stage} of 6</div>
      </div>

      <div className="irrigation-site__canvas">
        <svg viewBox="0 0 980 560" role="img" aria-label="A realistic school garden smart irrigation system being built step by step">
          <style>{`
            @keyframes waterPulse { 0%,100% { stroke-dashoffset: 0; opacity: .55; } 50% { stroke-dashoffset: -34; opacity: 1; } }
            @keyframes sprinklerSpray { 0%,100% { opacity: .2; transform: scale(.88); } 50% { opacity: .92; transform: scale(1.05); } }
            @keyframes controllerBlink { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
            @keyframes dropFall { from { transform: translateY(-16px); opacity: .9; } to { transform: translateY(28px); opacity: .08; } }
            .pipe-flow { animation: waterPulse 1.3s linear infinite; stroke-dasharray: 12 10; }
            .spray { animation: sprinklerSpray 1.25s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
            .blink { animation: controllerBlink 1s ease-in-out infinite; }
            .droplet { animation: dropFall 1s ease-in infinite; }
          `}</style>

          <defs>
            <linearGradient id="skyIrrigation" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="55%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
            <linearGradient id="soilGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="waterTank" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.24" />
            </filter>
          </defs>

          <rect width="980" height="560" fill="url(#skyIrrigation)" />
          <circle cx="86" cy="74" r="38" fill="#fde047" />
          <path d="M0 170 C120 136 250 160 370 132 C520 96 674 134 810 108 C890 92 940 100 980 88 L980 560 L0 560 Z" fill="#86efac" />
          <path d="M0 432 C125 405 260 426 390 404 C545 378 690 405 822 386 C910 374 950 382 980 368 L980 560 L0 560 Z" fill="#4ade80" opacity=".75" />

          <House x={60} y={170} color="#fef3c7" />
          <House x={800} y={168} color="#fee2e2" />
          <text x="100" y="260" textAnchor="middle" fill="#713f12" fontSize="15" fontWeight="900">SCHOOL</text>
          <text x="842" y="258" textAnchor="middle" fill="#713f12" fontSize="15" fontWeight="900">FARM SHED</text>

          <g filter="url(#softShadow)">
            <rect x="250" y="198" width="460" height="250" rx="26" fill="url(#soilGradient)" stroke="#78350f" strokeWidth="8" />
            <rect x="270" y="218" width="420" height="210" rx="18" fill={watered ? '#7c4a16' : '#6b3410'} opacity=".88" />
            {rowYs.map((y) => (
              <g key={y}>
                <line x1="292" y1={y} x2="668" y2={y} stroke="#facc15" strokeWidth="3" strokeDasharray="10 10" opacity={stage >= 1 ? '.95' : '.35'} />
                {[338, 430, 522, 614].map((x) => <Plant key={`${x}-${y}`} x={x} y={y + 32} watered={watered} />)}
              </g>
            ))}
          </g>

          {stage >= 1 && (
            <g>
              <rect x="242" y="190" width="476" height="266" rx="30" fill="none" stroke="#facc15" strokeWidth="5" strokeDasharray="16 10" />
              <text x="480" y="180" textAnchor="middle" fill="#713f12" fontSize="21" fontWeight="900">Garden bed marked: 10m × 4m = 40m²</text>
              {[250, 710, 250, 710].map((x, index) => <circle key={`${x}-${index}`} cx={x} cy={index < 2 ? 198 : 448} r="9" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" />)}
            </g>
          )}

          {stage >= 2 && (
            <g filter="url(#softShadow)">
              <rect x="205" y="286" width="36" height="104" rx="13" fill="#334155" />
              <line x1="223" y1="286" x2="223" y2="235" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
              <circle cx="223" cy="224" r="13" fill={watered ? '#22c55e' : '#f97316'} stroke="#0f172a" strokeWidth="4" />
              <rect x="154" y="252" width="96" height="40" rx="12" fill="#0f172a" />
              <text x="202" y="278" textAnchor="middle" fill="#fef3c7" fontSize="14" fontWeight="800">25% DRY</text>
            </g>
          )}

          {stage >= 3 && (
            <g filter="url(#softShadow)">
              <ellipse cx="754" cy="210" rx="62" ry="16" fill="#075985" />
              <rect x="692" y="210" width="124" height="178" rx="26" fill="url(#waterTank)" stroke="#0f172a" strokeWidth="5" />
              <ellipse cx="754" cy="388" rx="62" ry="16" fill="#082f49" />
              <text x="754" y="304" textAnchor="middle" fill="#e0f2fe" fontSize="21" fontWeight="900">80L</text>
              <text x="754" y="332" textAnchor="middle" fill="#bae6fd" fontSize="15" fontWeight="800">water tank</text>
            </g>
          )}

          {stage >= 4 && (
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M692 320 C650 320 626 320 670 320" stroke="#0369a1" strokeWidth="14" />
              <path d="M692 320 H674 V236 H668" stroke="#0f172a" strokeWidth="18" />
              <path d="M692 320 H674 V236 H668" stroke="#0284c7" strokeWidth="10" className={watered ? 'pipe-flow' : ''} />
              {rowYs.map((y) => (
                <g key={`pipe-${y}`}>
                  <path d={`M292 ${y} H668`} stroke="#0f172a" strokeWidth="13" />
                  <path d={`M292 ${y} H668`} stroke="#0284c7" strokeWidth="7" className={watered ? 'pipe-flow' : ''} />
                </g>
              ))}
            </g>
          )}

          {stage >= 5 && (
            <g>
              {sprinklerPoints.map((point, index) => (
                <g key={`${point.x}-${point.y}`}>
                  <circle cx={point.x} cy={point.y} r="10" fill="#0f172a" />
                  <circle cx={point.x} cy={point.y} r="6" fill="#38bdf8" />
                  {watered && (
                    <g className="spray" style={{ animationDelay: `${index * 90}ms` }}>
                      <path d={`M${point.x} ${point.y - 4} C${point.x - 42} ${point.y - 52} ${point.x - 72} ${point.y - 20} ${point.x - 92} ${point.y + 4}`} stroke="#bae6fd" strokeWidth="4" fill="none" opacity=".8" />
                      <path d={`M${point.x} ${point.y - 4} C${point.x + 42} ${point.y - 52} ${point.x + 72} ${point.y - 20} ${point.x + 92} ${point.y + 4}`} stroke="#bae6fd" strokeWidth="4" fill="none" opacity=".8" />
                      <circle className="droplet" cx={point.x - 36} cy={point.y - 18} r="4" fill="#e0f2fe" />
                      <circle className="droplet" cx={point.x + 36} cy={point.y - 18} r="4" fill="#e0f2fe" style={{ animationDelay: '.18s' }} />
                    </g>
                  )}
                </g>
              ))}
            </g>
          )}

          {stage >= 6 && (
            <g filter="url(#softShadow)">
              <rect x="95" y="326" width="100" height="92" rx="16" fill="#111827" stroke="#22c55e" strokeWidth="5" />
              <circle cx="126" cy="360" r="9" fill="#22c55e" className={watered ? 'blink' : ''} />
              <text x="145" y="366" fill="#dcfce7" fontSize="14" fontWeight="900">AUTO</text>
              <text x="145" y="392" fill="#bfdbfe" fontSize="13" fontWeight="800">8 min</text>
              <g transform="translate(95 252)">
                <rect x="0" y="0" width="104" height="44" rx="8" fill="#1d4ed8" stroke="#0f172a" strokeWidth="4" />
                <line x1="18" y1="0" x2="18" y2="44" stroke="#93c5fd" strokeWidth="2" />
                <line x1="52" y1="0" x2="52" y2="44" stroke="#93c5fd" strokeWidth="2" />
                <line x1="86" y1="0" x2="86" y2="44" stroke="#93c5fd" strokeWidth="2" />
                <text x="52" y="70" textAnchor="middle" fill="#1e3a8a" fontSize="15" fontWeight="900">solar controller</text>
              </g>
              <rect x="722" y="402" width="120" height="44" rx="10" fill="#fef3c7" stroke="#92400e" strokeWidth="4" />
              <text x="782" y="430" textAnchor="middle" fill="#713f12" fontSize="15" fontWeight="900">80L / 8 MIN</text>
            </g>
          )}
        </svg>
      </div>

      {stage >= 6 && (
        <button className="irrigation-site__test" type="button" onClick={() => setTesting(true)}>
          Test Irrigation
        </button>
      )}

      {watered && <p className="irrigation-site__complete">Smart Irrigation Complete — Garden Watered Automatically!</p>}

      <style>{`
        .irrigation-site{font-family:Inter,system-ui,sans-serif;color:#0f172a}.irrigation-site__header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1rem}.irrigation-site__eyebrow{margin:0;color:#15803d;font-size:.76rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.irrigation-site h2{margin:.15rem 0;font-size:clamp(1.25rem,3vw,2rem)}.irrigation-site p{margin:.2rem 0 0;color:#475569;font-weight:700}.irrigation-site__status{background:#dcfce7;border:2px solid #22c55e;color:#166534;border-radius:999px;padding:.65rem 1rem;font-weight:900;white-space:nowrap}.irrigation-site__canvas{background:#ecfdf5;border:4px solid #bbf7d0;border-radius:24px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.irrigation-site svg{display:block;width:100%;height:auto;min-height:340px}.irrigation-site__test{margin-top:1rem;width:100%;border:0;border-radius:18px;background:linear-gradient(135deg,#16a34a,#0ea5e9);color:white;font-weight:900;font-size:1.05rem;padding:1rem;box-shadow:0 16px 30px rgba(14,165,233,.22);cursor:pointer}.irrigation-site__complete{margin-top:.8rem!important;background:#dcfce7;color:#166534!important;border:2px solid #22c55e;border-radius:16px;padding:1rem;font-weight:900;text-align:center}@media (max-width:720px){.irrigation-site__header{flex-direction:column}.irrigation-site__status{border-radius:16px}.irrigation-site svg{min-height:260px}}
      `}</style>
    </div>
  );
}
