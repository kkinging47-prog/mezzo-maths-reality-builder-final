type Bridge2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const encouragement = [
  'Answer the first maths question to begin construction.',
  'Great surveying! The bridge span is marked on both banks.',
  'Strong start! The foundation and support points are ready.',
  'Excellent measuring! The main beams now span the stream.',
  'Nice counting! Deck planks are forming the walking path.',
  'Well done! Side rails make the bridge safer.',
  'Bridge Complete — Safe to Cross!'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

export default function Bridge2DConstructionSite({ buildStage, feedback }: Bridge2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : encouragement[stage];

  return (
    <div className="bridge-construction-site" aria-label={`Footbridge construction site stage ${stage} of 6`}>
      <div className="bridge-construction-header">
        <div>
          <p className="bridge-construction-eyebrow">Build a Footbridge Over a Stream</p>
          <h3>Construction Stage {stage} of 6</h3>
        </div>
        <div className={stage === 6 ? 'bridge-construction-status complete' : 'bridge-construction-status'}>
          {stage === 6 ? 'Bridge Complete — Safe to Cross!' : 'Answer correctly to build the next part'}
        </div>
      </div>

      <div className="bridge-construction-canvas">
        <svg viewBox="0 0 900 520" role="img" aria-labelledby="bridgeSiteTitle bridgeSiteDesc">
          <title id="bridgeSiteTitle">2D construction site beside a flowing stream</title>
          <desc id="bridgeSiteDesc">
            A practical construction simulator where bridge parts appear as mission questions are answered correctly.
          </desc>

          <defs>
            <linearGradient id="bridgeSky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#bfe9ff" />
              <stop offset="1" stopColor="#effbf1" />
            </linearGradient>
            <linearGradient id="bridgeWater" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#0ea5e9" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <filter id="bridgeSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="900" height="520" fill="url(#bridgeSky)" />
          <path d="M0 120 C160 80 260 150 420 110 C600 66 720 130 900 92 L900 520 L0 520 Z" fill="#86c46b" />
          <path d="M0 352 C130 323 210 338 305 313 C385 291 514 294 598 319 C700 350 790 337 900 316 L900 520 L0 520 Z" fill="#5ca842" />
          <path d="M0 248 C128 214 241 220 338 242 C449 268 552 267 675 232 C758 208 824 213 900 231 L900 356 C781 333 711 351 625 375 C519 405 418 398 305 368 C207 342 107 350 0 381 Z" fill="#8b5e34" opacity="0.55" />
          <path className="bridge-water" d="M0 215 C135 181 242 195 352 222 C460 249 552 247 666 213 C754 187 825 192 900 210 L900 338 C780 319 708 337 623 361 C518 390 416 383 302 353 C205 327 105 337 0 366 Z" fill="url(#bridgeWater)" />

          {[80, 210, 385, 590, 735, 835].map((x, i) => (
            <path key={x} className="bridge-ripple" style={{ animationDelay: `${i * 0.35}s` }} d={`M${x} ${250 + (i % 3) * 24} c34 -12 66 -12 102 0`} fill="none" stroke="#e0f7ff" strokeWidth="5" strokeLinecap="round" opacity="0.55" />
          ))}

          <path d="M0 198 C102 170 221 179 333 208 L302 353 C205 327 105 337 0 366 Z" fill="#7c4f2a" opacity="0.45" />
          <path d="M900 210 C819 193 747 193 666 213 L623 361 C708 337 780 319 900 338 Z" fill="#7c4f2a" opacity="0.45" />

          {[60, 126, 186, 715, 780, 840].map((x, i) => <ellipse key={x} cx={x} cy={390 + (i % 2) * 34} rx="22" ry="13" fill="#6b7280" opacity="0.9" />)}
          {[120, 250, 650, 760].map((x) => <g key={x}><rect x={x} y="420" width="82" height="18" rx="4" fill="#9a5b24" /><rect x={x + 10} y="398" width="82" height="18" rx="4" fill="#b87935" /></g>)}
          <g transform="translate(42 435)"><rect width="74" height="45" fill="#c08436" /><path d="M0 0 L37 -26 L74 0 Z" fill="#f59e0b" /><text x="37" y="29" textAnchor="middle" fontSize="13" fill="#3b2407" fontWeight="700">tools</text></g>

          <line className="bridge-guide" x1="160" y1="257" x2="740" y2="257" stroke="#f8fafc" strokeWidth="8" strokeDasharray="18 14" strokeLinecap="round" />
          <text x="450" y="228" textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="800">dashed bridge guide</text>

          {stage >= 1 && <g className="bridge-pop"><path d="M145 185 L145 304" stroke="#f97316" strokeWidth="6" /><path d="M755 185 L755 304" stroke="#f97316" strokeWidth="6" /><circle cx="145" cy="185" r="10" fill="#facc15" /><circle cx="755" cy="185" r="10" fill="#facc15" /><path d="M126 316 h48 M736 316 h48" stroke="#facc15" strokeWidth="5" strokeLinecap="round" /><text x="450" y="176" textAnchor="middle" fill="#7c2d12" fontSize="18" fontWeight="800">survey pegs and foundation markers</text></g>}
          {stage >= 2 && <g className="bridge-pop"><rect x="178" y="230" width="28" height="116" rx="5" fill="#7c3f16" /><rect x="232" y="228" width="28" height="132" rx="5" fill="#7c3f16" /><rect x="640" y="228" width="28" height="132" rx="5" fill="#7c3f16" /><rect x="694" y="230" width="28" height="116" rx="5" fill="#7c3f16" /><ellipse cx="219" cy="364" rx="64" ry="15" fill="#60401f" opacity="0.45" /><ellipse cx="681" cy="364" rx="64" ry="15" fill="#60401f" opacity="0.45" /></g>}
          {stage >= 3 && <g className="bridge-slide"><rect x="156" y="244" width="588" height="20" rx="7" fill="#8b4513" /><rect x="156" y="282" width="588" height="20" rx="7" fill="#8b4513" /></g>}
          {stage >= 4 && <g>{[0,1,2,3,4,5,6,7,8,9].map((n) => <rect className="bridge-plank" style={{ animationDelay: `${n * 0.08}s` }} key={n} x={180 + n * 54} y="234" width="40" height="82" rx="5" fill={n % 2 ? '#d59a55' : '#c9853b'} stroke="#7c3f16" strokeWidth="3" />)}</g>}
          {stage >= 5 && <g className="bridge-pop"><rect x="160" y="201" width="584" height="12" rx="6" fill="#925116" /><rect x="160" y="326" width="584" height="12" rx="6" fill="#925116" />{[178,270,362,454,546,638,730].map((x) => <g key={x}><rect x={x} y="198" width="10" height="42" fill="#6f3b12" /><rect x={x} y="296" width="10" height="42" fill="#6f3b12" /></g>)}</g>}
          {stage === 6 && <g><ellipse className="bridge-success-glow" cx="450" cy="260" rx="345" ry="128" fill="#fef08a" opacity="0.28" filter="url(#bridgeSoftGlow)" /><g className="bridge-walker"><circle cx="0" cy="0" r="11" fill="#7c2d12" /><rect x="-7" y="11" width="14" height="28" rx="6" fill="#2563eb" /><path d="M-7 38 l-13 22 M7 38 l13 22 M-7 19 l-18 14 M7 19 l18 -12" stroke="#111827" strokeWidth="5" strokeLinecap="round" /></g><text x="450" y="84" textAnchor="middle" fill="#166534" fontSize="30" fontWeight="900">Bridge Complete — Safe to Cross!</text></g>}
        </svg>
      </div>

      <p className={stage === 6 ? 'bridge-construction-feedback complete' : 'bridge-construction-feedback'}>{visibleFeedback}</p>

      <style>{`
        .bridge-construction-site{font-family:Inter,system-ui,sans-serif;color:#0f172a}.bridge-construction-header{display:flex;justify-content:space-between;gap:1rem;align-items:center;margin-bottom:1rem}.bridge-construction-eyebrow{margin:0;color:#0891b2;font-weight:800;font-size:.82rem;text-transform:uppercase;letter-spacing:.06em}.bridge-construction-site h3{margin:.2rem 0 0;font-size:clamp(1.25rem,3vw,2rem);color:#0f172a}.bridge-construction-status{background:#e0f2fe;border:2px solid #38bdf8;border-radius:999px;padding:.65rem 1rem;font-weight:800;color:#075985}.bridge-construction-status.complete{background:#dcfce7;border-color:#22c55e;color:#166534}.bridge-construction-canvas{background:#f0fdf4;border-radius:24px;overflow:hidden;border:4px solid #d9f99d;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.bridge-construction-canvas svg{display:block;width:100%;height:auto;min-height:330px}.bridge-water{animation:bridgeWaterShift 4s ease-in-out infinite alternate}.bridge-ripple{animation:bridgeRippleMove 2.8s ease-in-out infinite}.bridge-guide{animation:bridgeDash 1.7s linear infinite}.bridge-pop{animation:bridgePopIn .55s ease-out both}.bridge-slide{animation:bridgeSlideIn .75s ease-out both}.bridge-plank{opacity:0;animation:bridgePlankDrop .45s ease-out forwards}.bridge-success-glow{animation:bridgeGlowPulse 1.6s ease-in-out infinite}.bridge-walker{transform:translate(190px,224px);animation:bridgeWalkAcross 4.5s ease-in-out infinite}.bridge-construction-feedback{margin:1rem 0 0;background:#ecfeff;border:2px solid #67e8f9;border-radius:18px;padding:1rem;font-weight:800;color:#155e75}.bridge-construction-feedback.complete{background:#f0fdf4;border-color:#4ade80;color:#166534}@keyframes bridgeDash{to{stroke-dashoffset:-64}}@keyframes bridgeWaterShift{from{transform:translateX(-8px)}to{transform:translateX(8px)}}@keyframes bridgeRippleMove{50%{transform:translateX(20px);opacity:.85}}@keyframes bridgePopIn{from{opacity:0;transform:scale(.86);transform-origin:center}to{opacity:1;transform:scale(1)}}@keyframes bridgeSlideIn{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:translateX(0)}}@keyframes bridgePlankDrop{from{opacity:0;transform:translateY(-34px)}to{opacity:1;transform:translateY(0)}}@keyframes bridgeGlowPulse{50%{opacity:.55}}@keyframes bridgeWalkAcross{0%{transform:translate(190px,224px)}50%{transform:translate(710px,224px)}100%{transform:translate(190px,224px)}}@media (max-width:720px){.bridge-construction-header{align-items:flex-start;flex-direction:column}.bridge-construction-status{border-radius:16px}.bridge-construction-canvas svg{min-height:260px}}
      `}</style>
    </div>
  );
}
