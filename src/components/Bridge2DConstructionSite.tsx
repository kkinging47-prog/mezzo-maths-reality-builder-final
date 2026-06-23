import { useEffect, useState } from 'react';

type Bridge2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
  bridgeTested?: boolean;
};

const pierXs = [230, 360, 540, 670];
const plankXs = Array.from({ length: 10 }, (_, index) => 200 + index * 50);
const railPostXs = [190, 250, 310, 370, 430, 490, 550, 610, 670, 720];

const encouragement = [
  'Answer the first maths question to begin construction.',
  'Bridge span marked across the stream.',
  'Support piers are ready.',
  'Main beams now cross the stream.',
  'Deck planks and entry steps are forming the walking path.',
  'Side rails make the bridge safer.',
  'Bridge complete. Test it and watch the crossing.'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

function House({ x, y, body, roof }: { x: number; y: number; body: string; roof: string }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#softShadow)">
      <rect x="0" y="34" width="70" height="56" rx="5" fill={body} />
      <path d="M-8 38 L35 0 L78 38 Z" fill={roof} />
      <rect x="12" y="54" width="16" height="16" rx="2" fill="#dbeafe" />
      <rect x="42" y="54" width="16" height="16" rx="2" fill="#dbeafe" />
      <rect x="29" y="66" width="13" height="24" rx="2" fill="#78350f" />
    </g>
  );
}

function AccessSteps({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const startX = isLeft ? 116 : 746;
  const direction = isLeft ? 1 : -1;

  return (
    <g className="bridge-pop" filter="url(#softShadow)">
      {[0, 1, 2, 3].map((index) => {
        const x = startX + direction * index * 16;
        const width = 54 - index * 6;
        const drawX = isLeft ? x : x - width;
        return (
          <rect
            key={`${side}-step-${index}`}
            x={drawX}
            y={236 + index * 12}
            width={width}
            height="44"
            rx="6"
            fill={index % 2 ? '#b45309' : '#d97706'}
            stroke="#78350f"
            strokeWidth="3"
          />
        );
      })}
      <text x={isLeft ? 142 : 758} y="326" textAnchor="middle" fill="#78350f" fontSize="14" fontWeight="800">
        entry steps
      </text>
    </g>
  );
}

export default function Bridge2DConstructionSite({ buildStage, feedback, bridgeTested }: Bridge2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [localTested, setLocalTested] = useState(false);

  useEffect(() => {
    if (stage < 6) setLocalTested(false);
  }, [stage]);

  const tested = bridgeTested ?? localTested;
  const visibleFeedback = feedback && !feedback.includes('Not quite') && !feedback.includes('Try again') ? feedback : encouragement[stage];
  const stageSixTitle = tested ? 'Safe to Cross!' : 'Ready to Test!';

  return (
    <div className="bridge-construction-site" aria-label={`Footbridge construction site stage ${stage} of 6`}>
      <div className="bridge-construction-header">
        <div>
          <p className="bridge-construction-eyebrow">Footbridge Mission</p>
          <h3>Stage {stage}/6</h3>
        </div>
        <div className={stage === 6 ? 'bridge-construction-status complete' : 'bridge-construction-status'}>
          {stage === 6 ? stageSixTitle : visibleFeedback}
        </div>
      </div>

      <div className="bridge-construction-canvas">
        <svg viewBox="0 0 900 520" role="img" aria-labelledby="bridgeSiteTitle bridgeSiteDesc">
          <title id="bridgeSiteTitle">2D footbridge construction site with stream and bridge</title>
          <desc id="bridgeSiteDesc">The river flows vertically through the centre while the bridge is built horizontally from left to right.</desc>

          <defs>
            <linearGradient id="skyGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#bfdbfe" /><stop offset="58%" stopColor="#e0f2fe" /><stop offset="100%" stopColor="#dcfce7" /></linearGradient>
            <linearGradient id="grassGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#86efac" /><stop offset="100%" stopColor="#4ade80" /></linearGradient>
            <linearGradient id="riverGradient" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#38bdf8" /><stop offset="50%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#0284c7" /></linearGradient>
            <linearGradient id="woodGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b45309" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.22" /></filter>
            <filter id="successGlow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          <rect width="900" height="520" fill="url(#skyGradient)" />
          <circle cx="86" cy="70" r="34" fill="#fde047" opacity="0.95" />
          <g fill="#fff" opacity="0.72"><ellipse cx="190" cy="72" rx="52" ry="18" /><ellipse cx="232" cy="68" rx="34" ry="15" /><ellipse cx="685" cy="86" rx="58" ry="20" /><ellipse cx="735" cy="82" rx="36" ry="16" /></g>

          <path d="M0 155 C75 140 210 154 344 136 C356 218 336 315 365 520 L0 520 Z" fill="url(#grassGradient)" />
          <path d="M900 146 C825 132 700 154 556 136 C540 230 570 320 535 520 L900 520 Z" fill="url(#grassGradient)" />
          <path d="M344 136 C356 218 336 315 365 520" fill="none" stroke="#92400e" strokeWidth="20" strokeLinecap="round" opacity="0.85" />
          <path d="M556 136 C540 230 570 320 535 520" fill="none" stroke="#92400e" strokeWidth="20" strokeLinecap="round" opacity="0.85" />
          <path d="M358 136 C370 218 350 315 378 520" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          <path d="M542 136 C526 230 556 320 522 520" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity="0.7" />

          <House x={72} y={148} body="#f97316" roof="#7c2d12" />
          <House x={205} y={106} body="#fbbf24" roof="#b45309" />
          <House x={628} y={106} body="#38bdf8" roof="#1e3a8a" />
          <House x={760} y={158} body="#a78bfa" roof="#581c87" />
          <text x="142" y="118" textAnchor="middle" fill="#14532d" fontSize="16" fontWeight="800">left homes</text>
          <text x="736" y="118" textAnchor="middle" fill="#14532d" fontSize="16" fontWeight="800">right homes</text>

          <path className="construction-river" d="M345 -20 C372 70 330 145 360 225 C388 302 350 406 374 540 L526 540 C550 420 512 318 542 225 C572 132 530 62 555 -20 Z" fill="url(#riverGradient)" />
          <g className="river-ripples" fill="none" stroke="#e0f2fe" strokeWidth="5" strokeLinecap="round" opacity="0.68">
            <path d="M398 -25 C430 -8 474 -8 506 -25" /><path d="M382 40 C420 58 482 58 520 40" /><path d="M395 108 C430 126 475 126 510 108" /><path d="M378 180 C420 202 488 202 526 180" /><path d="M392 252 C430 270 480 270 514 252" /><path d="M380 326 C422 348 490 348 528 326" /><path d="M396 398 C432 416 476 416 510 398" /><path d="M382 470 C420 488 486 488 524 470" />
          </g>

          <g opacity="0.95">
            <circle cx="95" cy="355" r="11" fill="#78716c" /><circle cx="135" cy="402" r="7" fill="#57534e" /><circle cx="775" cy="374" r="12" fill="#78716c" /><circle cx="820" cy="430" r="8" fill="#57534e" />
            <rect x="82" y="448" width="92" height="12" rx="3" fill="#a16207" /><rect x="108" y="430" width="92" height="12" rx="3" fill="#b45309" /><rect x="710" y="438" width="90" height="12" rx="3" fill="#a16207" /><rect x="745" y="416" width="88" height="12" rx="3" fill="#b45309" />
            <g transform="translate(62 390)"><rect width="68" height="42" rx="4" fill="#c08436" /><path d="M0 0 L34 -22 L68 0 Z" fill="#f59e0b" /><text x="34" y="27" textAnchor="middle" fontSize="12" fill="#3b2407" fontWeight="700">tools</text></g>
            {[65, 118, 292, 610, 760, 845].map((x) => (<g key={x} stroke="#166534" strokeWidth="4" strokeLinecap="round"><path d={`M${x} 502 L${x - 8} 486`} /><path d={`M${x} 502 L${x + 7} 488`} /><path d={`M${x} 502 L${x} 482`} /></g>))}
          </g>

          <line className="bridge-guide" x1="180" y1="260" x2="720" y2="260" stroke="#facc15" strokeWidth="5" strokeDasharray="16 12" strokeLinecap="round" />
          <text x="450" y="194" textAnchor="middle" fill="#854d0e" fontSize="20" fontWeight="800">bridge guide crosses the stream</text>

          {stage >= 1 && (<g className="bridge-pop"><g fill="#ef4444" stroke="#7f1d1d" strokeWidth="3"><path d="M180 260 L166 220 L194 220 Z" /><path d="M720 260 L706 220 L734 220 Z" /><line x1="180" y1="260" x2="180" y2="315" /><line x1="720" y1="260" x2="720" y2="315" /></g><text x="450" y="382" textAnchor="middle" fill="#1e3a8a" fontSize="22" fontWeight="800">Span marked.</text></g>)}

          {stage >= 2 && (<g className="bridge-pop" filter="url(#softShadow)">{pierXs.map((x) => (<g key={x}><rect x={x - 12} y="210" width="24" height="120" rx="7" fill="#64748b" /><rect x={x - 24} y="323" width="48" height="14" rx="4" fill="#475569" /></g>))}</g>)}

          {stage >= 3 && (<g className="bridge-slide" filter="url(#softShadow)"><rect x="170" y="235" width="560" height="16" rx="6" fill="url(#woodGradient)" /><rect x="170" y="290" width="560" height="16" rx="6" fill="url(#woodGradient)" /></g>)}

          {stage >= 4 && (<g filter="url(#softShadow)"><AccessSteps side="left" /><AccessSteps side="right" />{plankXs.map((x, index) => (<rect key={x} x={x} y="230" width="38" height="80" rx="5" fill={index % 2 ? '#d97706' : '#f59e0b'} stroke="#78350f" strokeWidth="3" className="bridge-plank" style={{ animationDelay: `${index * 80}ms` }} />))}</g>)}

          {stage >= 5 && (<g className="bridge-pop" filter="url(#softShadow)" strokeLinecap="round"><line x1="170" y1="215" x2="730" y2="215" stroke="#334155" strokeWidth="9" /><line x1="170" y1="325" x2="730" y2="325" stroke="#334155" strokeWidth="9" />{railPostXs.map((x) => (<line key={x} x1={x} y1="215" x2={x} y2="325" stroke="#475569" strokeWidth="8" />))}</g>)}

          {stage === 6 && (<g><rect x="154" y="203" width="592" height="136" rx="28" fill="#fef08a" opacity="0.45" className="bridge-success-glow" filter="url(#successGlow)" /><text x="450" y="76" textAnchor="middle" fill="#166534" fontSize="30" fontWeight="900">{tested ? 'Bridge Test Passed — Safe to Cross!' : 'Bridge Complete — Ready to Test!'}</text>{tested && (<g className="bridge-walker"><circle cx="195" cy="250" r="11" fill="#7c3aed" /><rect x="188" y="262" width="14" height="25" rx="6" fill="#2563eb" /><line x1="188" y1="276" x2="176" y2="290" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" /><line x1="202" y1="276" x2="214" y2="290" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" /></g>)}</g>)}
        </svg>
      </div>

      <p className={stage === 6 ? 'bridge-construction-feedback complete' : 'bridge-construction-feedback'}>{visibleFeedback}</p>

      {stage === 6 && !tested && (<button className="bridge-test-button" type="button" onClick={() => setLocalTested(true)}>Test Bridge</button>)}
      {stage === 6 && tested && (<p className="bridge-test-note">The bridge test passed. The student is crossing safely.</p>)}

      <style>{`
        .bridge-construction-site{height:100%;display:grid;grid-template-rows:auto minmax(0,1fr) auto;color:#0f172a;font-family:Inter,system-ui,sans-serif;gap:.45rem;min-height:0}.bridge-construction-header{display:flex;justify-content:space-between;gap:.7rem;align-items:center;margin:0}.bridge-construction-eyebrow{margin:0;color:#8fffd2;font-weight:900;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em}.bridge-construction-site h3{margin:.05rem 0 0;font-size:clamp(1rem,1.8vw,1.45rem);color:#f8fafc}.bridge-construction-status{background:#0e7490;border:2px solid #67e8f9;border-radius:999px;padding:.45rem .65rem;font-weight:900;color:#ecfeff;font-size:.78rem;line-height:1.15;max-width:52%;text-align:center}.bridge-construction-status.complete{background:#dcfce7;border-color:#22c55e;color:#166534}.bridge-construction-canvas{height:100%;min-height:0;background:#f0fdf4;border-radius:18px;overflow:hidden;border:3px solid #d9f99d;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.bridge-construction-canvas svg{display:block;width:100%;height:100%;min-height:250px}.river-ripples{animation:riverFlowDown 3.4s linear infinite}.bridge-guide{animation:bridgeDash 1.7s linear infinite}.bridge-pop{animation:bridgePopIn .45s ease-out both}.bridge-slide{animation:bridgeSlideIn .62s ease-out both}.bridge-plank{opacity:0;animation:bridgePlankDrop .34s ease-out forwards}.bridge-success-glow{animation:bridgeGlowPulse 1.6s ease-in-out infinite}.bridge-walker{animation:bridgeWalkAcross 4.8s ease-in-out infinite alternate}.bridge-construction-feedback{margin:0;background:#ecfeff;border:2px solid #67e8f9;border-radius:14px;padding:.55rem .7rem;font-weight:900;color:#155e75;font-size:.82rem;line-height:1.2}.bridge-construction-feedback.complete{background:#f0fdf4;border-color:#4ade80;color:#166534}.bridge-test-button{justify-self:start;margin:0;border:0;border-radius:999px;background:linear-gradient(135deg,#16a34a,#22c55e);color:white;font-weight:900;padding:.62rem 1rem;cursor:pointer;box-shadow:0 12px 24px rgba(22,163,74,.28)}.bridge-test-note{margin:0;color:#dcfce7;font-weight:900;font-size:.82rem}@keyframes riverFlowDown{from{transform:translateY(-90px)}to{transform:translateY(90px)}}@keyframes bridgeDash{to{stroke-dashoffset:-64}}@keyframes bridgePopIn{from{opacity:0;transform:scale(.86);transform-origin:center}to{opacity:1;transform:scale(1)}}@keyframes bridgeSlideIn{from{opacity:0;transform:translateX(-620px)}to{opacity:1;transform:translateX(0)}}@keyframes bridgePlankDrop{from{opacity:0;transform:translateY(-22px)}to{opacity:1;transform:translateY(0)}}@keyframes bridgeGlowPulse{50%{opacity:.78}}@keyframes bridgeWalkAcross{from{transform:translateX(0)}to{transform:translateX(510px)}}@media (max-width:720px){.bridge-construction-header{align-items:flex-start;flex-direction:column}.bridge-construction-status{border-radius:14px;max-width:100%}.bridge-construction-canvas svg{min-height:300px}}
      `}</style>
    </div>
  );
}
