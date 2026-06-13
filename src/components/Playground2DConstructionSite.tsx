import { useEffect, useState } from 'react';

type Playground2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const matTiles = Array.from({ length: 8 }, (_, index) => ({
  x: 302 + (index % 4) * 66,
  y: 258 + Math.floor(index / 4) * 46,
  color: ['#fef08a', '#93c5fd', '#86efac', '#fca5a5'][index % 4]
}));

const fencePosts = [226, 286, 346, 406, 466, 526, 586, 646, 706];

const encouragement = [
  'Answer the first maths question to begin planning the playground.',
  'Great measuring! The playground boundary is now marked with pegs and ropes.',
  'Good safety thinking! The safe play zone is marked inside the field.',
  'Excellent! Soft safety mats now protect the pupils.',
  'Well done! The swing set has been installed.',
  'Great measuring! The slide and ladder are ready.',
  'Playground complete. Click Test Playground to let pupils try it safely.'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

function SchoolBuilding() {
  return (
    <g filter="url(#softShadow)">
      <rect x="42" y="70" width="178" height="110" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="4" />
      <path d="M28 74 L131 18 L235 74 Z" fill="#b45309" />
      <rect x="76" y="112" width="30" height="30" rx="4" fill="#bfdbfe" />
      <rect x="154" y="112" width="30" height="30" rx="4" fill="#bfdbfe" />
      <rect x="116" y="120" width="30" height="60" rx="5" fill="#92400e" />
      <text x="131" y="202" textAnchor="middle" fill="#713f12" fontSize="20" fontWeight="900">SCHOOL</text>
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-8" y="42" width="16" height="48" rx="6" fill="#92400e" />
      <circle cx="0" cy="34" r="32" fill="#16a34a" />
      <circle cx="-23" cy="45" r="22" fill="#22c55e" />
      <circle cx="24" cy="47" r="22" fill="#15803d" />
    </g>
  );
}

function Child({ x, y, shirt }: { x: number; y: number; shirt: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="9" fill="#7c2d12" />
      <rect x="-7" y="10" width="14" height="24" rx="6" fill={shirt} />
      <path d="M-6 31 l-11 16 M6 31 l11 16 M-7 18 l-13 8 M7 18 l13 -8" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export default function Playground2DConstructionSite({ buildStage, feedback }: Playground2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    if (stage < 6) {
      setTested(false);
    }
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : encouragement[stage];

  return (
    <div className="playground-site" aria-label={`School playground construction site stage ${stage} of 6`}>
      <div className="playground-site-header">
        <div>
          <p className="playground-eyebrow">Build a Safe School Playground</p>
          <h3>Construction Stage {stage} of 6</h3>
        </div>
        <div className={stage === 6 ? 'playground-status complete' : 'playground-status'}>
          {stage === 6 ? (tested ? 'Test Passed — Safe for Pupils!' : 'Ready for Playground Test') : 'Answer correctly to build the next part'}
        </div>
      </div>

      <div className="playground-canvas">
        <svg viewBox="0 0 920 560" role="img" aria-labelledby="playgroundTitle playgroundDesc">
          <title id="playgroundTitle">2D realistic school playground construction site</title>
          <desc id="playgroundDesc">A school field becomes a safe playground as each practical maths question is answered correctly.</desc>

          <defs>
            <linearGradient id="playgroundSky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="65%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
            <linearGradient id="fieldGrass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="softShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.2" />
            </filter>
          </defs>

          <rect width="920" height="560" fill="url(#playgroundSky)" />
          <circle cx="810" cy="76" r="38" fill="#fde047" opacity="0.96" />
          <g fill="#fff" opacity="0.68">
            <ellipse cx="340" cy="70" rx="56" ry="18" />
            <ellipse cx="390" cy="66" rx="36" ry="14" />
            <ellipse cx="680" cy="118" rx="62" ry="20" />
            <ellipse cx="732" cy="113" rx="36" ry="14" />
          </g>

          <rect x="0" y="182" width="920" height="378" fill="url(#fieldGrass)" />
          <path d="M0 428 C116 390 190 420 298 390 C420 356 504 414 638 386 C748 362 828 382 920 350 L920 560 L0 560 Z" fill="#4ade80" opacity="0.48" />
          <path d="M250 218 L744 218 L786 452 L204 452 Z" fill="#92400e" opacity="0.38" />
          <path d="M268 236 L724 236 L760 430 L232 430 Z" fill="#a3e635" opacity="0.55" />

          <SchoolBuilding />
          <Tree x={276} y={78} />
          <Tree x={832} y={236} />
          <Tree x={84} y={350} />

          <g opacity="0.9">
            <rect x="675" y="475" width="96" height="14" rx="4" fill="#b45309" />
            <rect x="700" y="452" width="96" height="14" rx="4" fill="#92400e" />
            <circle cx="794" cy="458" r="11" fill="#64748b" />
            <circle cx="826" cy="492" r="8" fill="#475569" />
            <text x="735" y="510" textAnchor="middle" fill="#14532d" fontSize="15" fontWeight="800">materials ready</text>
          </g>

          <line x1="240" y1="246" x2="728" y2="246" stroke="#f97316" strokeWidth="4" strokeDasharray="12 10" />
          <line x1="728" y1="246" x2="764" y2="430" stroke="#f97316" strokeWidth="4" strokeDasharray="12 10" />
          <line x1="764" y1="430" x2="224" y2="430" stroke="#f97316" strokeWidth="4" strokeDasharray="12 10" />
          <line x1="224" y1="430" x2="240" y2="246" stroke="#f97316" strokeWidth="4" strokeDasharray="12 10" />
          <text x="494" y="222" textAnchor="middle" fill="#7c2d12" fontSize="18" fontWeight="900">empty school field for playground</text>

          {stage >= 1 && (
            <g className="playground-pop">
              <path d="M238 244 L728 244 L766 432 L224 432 Z" fill="none" stroke="#facc15" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              {[238, 728, 766, 224].map((x, index) => (
                <g key={`${x}-${index}`}>
                  <circle cx={x} cy={[244, 244, 432, 432][index]} r="10" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" />
                  <line x1={x} y1={[244, 244, 432, 432][index]} x2={x} y2={[244, 244, 432, 432][index] + 44} stroke="#7f1d1d" strokeWidth="4" />
                </g>
              ))}
              <text x="494" y="466" textAnchor="middle" fill="#854d0e" fontSize="20" fontWeight="900">12m × 8m playground boundary marked</text>
            </g>
          )}

          {stage >= 2 && (
            <g className="playground-pop">
              <path d="M318 262 L660 262 L690 410 L292 410 Z" fill="#fef3c7" opacity="0.58" stroke="#2563eb" strokeWidth="6" strokeDasharray="14 10" />
              <text x="492" y="294" textAnchor="middle" fill="#1e3a8a" fontSize="20" fontWeight="900">safe play zone: 4m wide</text>
              <text x="252" y="302" fill="#1d4ed8" fontSize="15" fontWeight="800">2m safety space</text>
              <text x="668" y="302" fill="#1d4ed8" fontSize="15" fontWeight="800">2m safety space</text>
            </g>
          )}

          {stage >= 3 && (
            <g filter="url(#softShadow)">
              {matTiles.map((tile, index) => (
                <rect
                  key={`${tile.x}-${tile.y}`}
                  className="mat-drop"
                  x={tile.x}
                  y={tile.y}
                  width="62"
                  height="42"
                  rx="7"
                  fill={tile.color}
                  stroke="#334155"
                  strokeWidth="2"
                  style={{ animationDelay: `${index * 90}ms` }}
                />
              ))}
              <text x="492" y="382" textAnchor="middle" fill="#166534" fontSize="20" fontWeight="900">8 soft safety mats laid</text>
            </g>
          )}

          {stage >= 4 && (
            <g className="playground-pop" filter="url(#softShadow)">
              <line x1="355" y1="250" x2="355" y2="355" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
              <line x1="505" y1="250" x2="505" y2="355" stroke="#475569" strokeWidth="9" strokeLinecap="round" />
              <line x1="342" y1="250" x2="518" y2="250" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
              {[376, 430, 484].map((x, index) => (
                <g key={x}>
                  <line x1={x - 12} y1="255" x2={x - 12} y2="315" stroke="#111827" strokeWidth="4" />
                  <line x1={x + 12} y1="255" x2={x + 12} y2="315" stroke="#111827" strokeWidth="4" />
                  <rect x={x - 24} y="315" width="48" height="15" rx="7" fill={['#ef4444', '#3b82f6', '#f59e0b'][index]} />
                </g>
              ))}
              <text x="430" y="238" textAnchor="middle" fill="#0f172a" fontSize="17" fontWeight="900">3 swings, 6 chains</text>
            </g>
          )}

          {stage >= 5 && (
            <g className="playground-slide-in" filter="url(#softShadow)">
              <rect x="565" y="278" width="70" height="60" rx="8" fill="#2563eb" />
              <path d="M635 304 C692 326 712 364 734 404" fill="none" stroke="#ef4444" strokeWidth="24" strokeLinecap="round" />
              <path d="M560 338 L520 410" stroke="#92400e" strokeWidth="9" strokeLinecap="round" />
              {[0, 1, 2, 3, 4].map((n) => (
                <line key={n} x1={552 - n * 8} y1={352 + n * 14} x2={584 - n * 4} y2={352 + n * 14} stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
              ))}
              <text x="640" y="266" textAnchor="middle" fill="#7f1d1d" fontSize="18" fontWeight="900">slide ladder: 5 steps</text>
            </g>
          )}

          {stage >= 6 && (
            <g className="playground-pop">
              <path d="M206 220 L746 220 L792 456 L194 456 Z" fill="none" stroke="#78350f" strokeWidth="8" strokeLinejoin="round" />
              {fencePosts.map((x, index) => (
                <line key={x} x1={x} y1="220" x2={x} y2="456" stroke="#92400e" strokeWidth="4" opacity={index % 2 ? 0.55 : 0.85} />
              ))}
              <rect x="448" y="444" width="72" height="24" rx="4" fill="#fef3c7" stroke="#92400e" strokeWidth="5" />
              <rect x="246" y="224" width="92" height="32" rx="6" fill="#facc15" stroke="#854d0e" strokeWidth="3" />
              <text x="292" y="246" textAnchor="middle" fill="#854d0e" fontSize="14" fontWeight="900">PLAY SAFE</text>
              <rect className="playground-glow" x="248" y="238" width="500" height="210" rx="28" fill="#fef08a" opacity="0.26" />
              {tested && (
                <g>
                  <g className="children-play">
                    <Child x={306} y={334} shirt="#22c55e" />
                    <Child x={454} y={380} shirt="#ef4444" />
                    <Child x={642} y={360} shirt="#8b5cf6" />
                  </g>
                  <text x="492" y="92" textAnchor="middle" fill="#166534" fontSize="30" fontWeight="900">Playground Complete — Safe for Pupils!</text>
                </g>
              )}
              {!tested && <text x="492" y="92" textAnchor="middle" fill="#854d0e" fontSize="28" fontWeight="900">Playground Complete — Ready to Test!</text>}
            </g>
          )}
        </svg>
      </div>

      <div className="playground-feedback-row">
        <p className={stage === 6 ? 'playground-feedback complete' : 'playground-feedback'}>{visibleFeedback}</p>
        {stage === 6 && (
          <button className="playground-test-button" type="button" onClick={() => setTested(true)}>
            {tested ? 'Playground Tested' : 'Test Playground'}
          </button>
        )}
      </div>

      <style>{`
        .playground-site{font-family:Inter,system-ui,sans-serif;color:#0f172a}.playground-site-header{display:flex;justify-content:space-between;gap:1rem;align-items:center;margin-bottom:1rem}.playground-eyebrow{margin:0;color:#7c3aed;font-weight:900;font-size:.78rem;text-transform:uppercase;letter-spacing:.08em}.playground-site h3{margin:.15rem 0 0;font-size:clamp(1.25rem,2.6vw,2rem)}.playground-status{background:#ede9fe;border:2px solid #a78bfa;border-radius:999px;padding:.65rem 1rem;font-weight:900;color:#5b21b6}.playground-status.complete{background:#dcfce7;border-color:#22c55e;color:#166534}.playground-canvas{background:#f0fdf4;border-radius:24px;overflow:hidden;border:4px solid #bbf7d0;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.playground-canvas svg{display:block;width:100%;height:auto;min-height:330px}.playground-pop{animation:playgroundPop .55s ease-out both}.playground-slide-in{animation:slideIn .7s ease-out both}.mat-drop{opacity:0;animation:matDrop .42s ease-out forwards}.playground-glow{animation:playgroundGlow 1.6s ease-in-out infinite}.children-play{animation:childrenBounce 1.2s ease-in-out infinite alternate;transform-origin:center}.playground-feedback-row{display:flex;gap:.85rem;align-items:center;margin-top:1rem}.playground-feedback{flex:1;margin:0;background:#f5f3ff;border:2px solid #c4b5fd;border-radius:18px;padding:1rem;font-weight:900;color:#5b21b6}.playground-feedback.complete{background:#f0fdf4;border-color:#4ade80;color:#166534}.playground-test-button{border:0;border-radius:999px;background:#16a34a;color:white;font-weight:900;padding:1rem 1.2rem;box-shadow:0 12px 26px rgba(22,163,74,.26);cursor:pointer}.playground-test-button:hover{transform:translateY(-1px)}@keyframes playgroundPop{from{opacity:0;transform:scale(.86);transform-origin:center}to{opacity:1;transform:scale(1)}}@keyframes slideIn{from{opacity:0;transform:translateX(90px)}to{opacity:1;transform:translateX(0)}}@keyframes matDrop{from{opacity:0;transform:translateY(-28px)}to{opacity:1;transform:translateY(0)}}@keyframes playgroundGlow{50%{opacity:.48}}@keyframes childrenBounce{from{transform:translateY(0)}to{transform:translateY(-10px)}}@media(max-width:720px){.playground-site-header,.playground-feedback-row{align-items:flex-start;flex-direction:column}.playground-status{border-radius:16px}.playground-test-button{width:100%}.playground-canvas svg{min-height:270px}}
      `}</style>
    </div>
  );
}
