import { useEffect, useState } from 'react';

type Ferry2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const passengerSeats = [0, 1, 2, 3, 4, 5];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

export default function Ferry2DConstructionSite({ buildStage, feedback }: Ferry2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    if (stage < 6) setTestStarted(false);
  }, [stage]);

  const ferryClass = stage >= 6 && testStarted ? 'ferry-craft ferry-crossing' : 'ferry-craft';

  return (
    <div className="ferry-site" aria-label={`Ferry river crossing construction site stage ${stage} of 6`}>
      <style>{`
        .ferry-site{position:relative;overflow:hidden;border-radius:24px;border:1px solid rgba(34,211,238,.35);background:#082f49;box-shadow:inset 0 0 0 1px rgba(255,255,255,.05)}
        .ferry-site svg{display:block;width:100%;height:auto;min-height:390px}.ferry-panel{position:absolute;left:16px;top:16px;z-index:2;max-width:420px;border-radius:18px;background:rgba(8,47,73,.84);padding:12px 14px;color:#e0f2fe;backdrop-filter:blur(8px);box-shadow:0 10px 30px rgba(15,23,42,.22)}
        .ferry-panel strong{display:block;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#67e8f9}.ferry-panel span{display:block;margin-top:4px;font-weight:800;color:#fff}.ferry-panel p{margin:4px 0 0;font-size:12px;color:#bbf7d0}.ferry-test{position:absolute;right:18px;bottom:18px;z-index:3;border:0;border-radius:999px;background:linear-gradient(135deg,#facc15,#f97316);color:#431407;font-weight:900;padding:12px 18px;box-shadow:0 12px 25px rgba(15,23,42,.24);cursor:pointer}.ferry-test:active{transform:translateY(1px)}
        .river-flow{animation:riverFlow 4s linear infinite}.crossing-line{animation:dashMove 1.4s linear infinite}.pop-in{animation:popIn .55s ease-out both}.dock-build{animation:dockBuild .55s ease-out both}.platform-build{animation:platformBuild .7s ease-out both}.seat-pop{animation:seatPop .35s ease-out both}.flag-wave{transform-origin:660px 190px;animation:flagWave 1.4s ease-in-out infinite}.ferry-crossing{animation:ferryCross 5.2s ease-in-out forwards}.passenger-wave{transform-origin:center;animation:passengerWave 1.1s ease-in-out infinite}.success-glow{animation:glowPulse 1.5s ease-in-out infinite}.smoke{animation:smokeRise 2s ease-out infinite}
        @keyframes riverFlow{from{transform:translateY(-88px)}to{transform:translateY(88px)}}@keyframes dashMove{to{stroke-dashoffset:-60}}@keyframes popIn{from{opacity:0;transform:scale(.85);transform-origin:center}to{opacity:1;transform:scale(1)}}@keyframes dockBuild{from{opacity:0;transform:translateY(35px)}to{opacity:1;transform:translateY(0)}}@keyframes platformBuild{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:translateX(0)}}@keyframes seatPop{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}@keyframes flagWave{50%{transform:skewY(-5deg)}}@keyframes ferryCross{0%{transform:translate(266px,236px)}12%{transform:translate(266px,236px)}82%{transform:translate(514px,236px)}100%{transform:translate(514px,236px)}}@keyframes passengerWave{50%{transform:rotate(8deg)}}@keyframes glowPulse{50%{opacity:.72}}@keyframes smokeRise{from{opacity:.75;transform:translateY(0) scale(.7)}to{opacity:0;transform:translateY(-34px) scale(1.2)}}
      `}</style>

      <div className="ferry-panel">
        <strong>Ferry river crossing</strong>
        <span>Construction Stage {stage} of 6</span>
        <p>{stage < 6 ? 'Answer correctly to build the next ferry part.' : testStarted ? 'The ferry is crossing safely to the opposite bank.' : 'All safety checks are complete. Test the ferry crossing.'}</p>
        {feedback && !feedback.includes('Not quite') && <p>{feedback}</p>}
      </div>

      {stage >= 6 && (
        <button className="ferry-test" type="button" onClick={() => setTestStarted(true)}>
          {testStarted ? 'Ferry Crossing...' : 'Test Ferry'}
        </button>
      )}

      <svg viewBox="0 0 900 520" role="img" aria-label="A realistic 2D ferry construction scene with a vertical river and docks on both banks">
        <defs>
          <linearGradient id="ferrySky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="58%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#d9f99d" />
          </linearGradient>
          <linearGradient id="ferryWater" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="45%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="ferryWood" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <filter id="ferryShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0f172a" floodOpacity=".28" />
          </filter>
        </defs>

        <rect width="900" height="520" fill="url(#ferrySky)" />
        <circle cx="815" cy="72" r="36" fill="#fde047" opacity=".95" />
        <g opacity=".78" fill="#fff"><ellipse cx="175" cy="80" rx="55" ry="18"/><ellipse cx="218" cy="76" rx="35" ry="14"/><ellipse cx="620" cy="66" rx="60" ry="20"/><ellipse cx="670" cy="62" rx="38" ry="15"/></g>

        <path d="M0 118 C95 90 205 120 330 98 C350 210 330 318 360 540 L0 540 Z" fill="#65a30d" />
        <path d="M900 112 C805 92 705 118 570 98 C550 210 575 320 540 540 L900 540 Z" fill="#65a30d" />
        <path d="M330 98 C350 210 330 318 360 540" fill="none" stroke="#7c2d12" strokeWidth="20" strokeLinecap="round" opacity=".82" />
        <path d="M570 98 C550 210 575 320 540 540" fill="none" stroke="#7c2d12" strokeWidth="20" strokeLinecap="round" opacity=".82" />
        <path d="M344 98 C364 210 344 318 374 540" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity=".7" />
        <path d="M556 98 C536 210 561 320 526 540" fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" opacity=".7" />

        <path d="M340 -20 C365 72 330 142 360 224 C392 310 350 420 382 545 L518 545 C552 420 510 312 540 224 C572 140 535 70 560 -20 Z" fill="url(#ferryWater)" />
        <g className="river-flow" fill="none" stroke="#e0f2fe" strokeWidth="5" strokeLinecap="round" opacity=".65">
          <path d="M384 -35 C420 -16 480 -16 516 -35"/><path d="M375 42 C416 62 486 62 525 42"/><path d="M392 118 C426 136 474 136 508 118"/><path d="M374 194 C418 216 486 216 528 194"/><path d="M390 272 C426 292 476 292 512 272"/><path d="M374 350 C418 370 486 370 528 350"/><path d="M390 432 C426 452 476 452 512 432"/><path d="M378 520 C416 540 486 540 522 520"/>
        </g>

        <g>
          <rect x="58" y="150" width="82" height="52" rx="6" fill="#fef3c7" stroke="#92400e" strokeWidth="4"/><path d="M50 150 L100 112 L150 150 Z" fill="#dc2626"/><rect x="88" y="170" width="20" height="32" fill="#7c2d12"/>
          <rect x="730" y="150" width="84" height="54" rx="6" fill="#cffafe" stroke="#0369a1" strokeWidth="4"/><path d="M720 150 L772 112 L824 150 Z" fill="#7c3aed"/><rect x="762" y="172" width="20" height="32" fill="#0f172a"/>
          <rect x="108" y="398" width="92" height="14" rx="4" fill="#a16207"/><rect x="130" y="374" width="92" height="14" rx="4" fill="#b45309"/><rect x="685" y="398" width="92" height="14" rx="4" fill="#a16207"/><rect x="710" y="374" width="92" height="14" rx="4" fill="#b45309"/>
          {[92,170,268,628,735,820].map((x) => <g key={x} stroke="#14532d" strokeWidth="4" strokeLinecap="round"><path d={`M${x} 500 L${x - 8} 480`} /><path d={`M${x} 500 L${x + 8} 480`} /><path d={`M${x} 500 L${x} 474`} /></g>)}
          {[245,302,625,660].map((x, index) => <ellipse key={x} cx={x} cy={index % 2 ? 430 : 356} rx="16" ry="10" fill="#64748b" />)}
          <g transform="translate(205 238)"><circle cx="0" cy="0" r="10" fill="#7c2d12"/><rect x="-6" y="11" width="12" height="25" rx="5" fill="#2563eb"/></g>
          <g transform="translate(682 238)"><circle cx="0" cy="0" r="10" fill="#7c2d12"/><rect x="-6" y="11" width="12" height="25" rx="5" fill="#16a34a"/></g>
        </g>

        {stage >= 1 && (
          <g className="pop-in">
            <line className="crossing-line" x1="230" y1="260" x2="670" y2="260" stroke="#facc15" strokeWidth="5" strokeDasharray="16 12" strokeLinecap="round" />
            <circle cx="230" cy="260" r="12" fill="#f97316" stroke="#7c2d12" strokeWidth="4"/><circle cx="670" cy="260" r="12" fill="#f97316" stroke="#7c2d12" strokeWidth="4"/>
            <text x="450" y="218" textAnchor="middle" fill="#78350f" fontSize="20" fontWeight="800">22m guide rope crossing line</text>
          </g>
        )}

        {stage >= 2 && (
          <g className="dock-build" filter="url(#ferryShadow)">
            <rect x="238" y="232" width="112" height="58" rx="8" fill="url(#ferryWood)"/><rect x="550" y="232" width="112" height="58" rx="8" fill="url(#ferryWood)"/>
            {[250,272,294,316,338].map((x) => <line key={x} x1={x} y1="234" x2={x} y2="288" stroke="#fed7aa" strokeWidth="3" opacity=".75" />)}
            {[562,584,606,628,650].map((x) => <line key={x} x1={x} y1="234" x2={x} y2="288" stroke="#fed7aa" strokeWidth="3" opacity=".75" />)}
            <text x="450" y="322" textAnchor="middle" fill="#78350f" fontSize="18" fontWeight="800">two landing docks built</text>
          </g>
        )}

        {stage >= 3 && (
          <g className={ferryClass} filter="url(#ferryShadow)">
            <ellipse cx="72" cy="76" rx="82" ry="19" fill="#0f172a" opacity=".22" />
            <path d="M0 40 L144 40 L128 96 L18 96 Z" fill="#475569" stroke="#0f172a" strokeWidth="4" />
            <rect x="16" y="20" width="112" height="40" rx="10" fill="#f59e0b" stroke="#92400e" strokeWidth="4" />
            <line x1="12" y1="60" x2="132" y2="60" stroke="#78350f" strokeWidth="5" />
            {stage >= 4 && passengerSeats.map((seat, index) => (
              <g key={seat} className="seat-pop" style={{ animationDelay: `${index * 90}ms` }}>
                <rect x={28 + (index % 3) * 30} y={26 + Math.floor(index / 3) * 18} width="20" height="12" rx="4" fill="#1e3a8a" />
                <circle cx={38 + (index % 3) * 30} cy={22 + Math.floor(index / 3) * 18} r="4" fill="#fde68a" />
              </g>
            ))}
            {stage >= 5 && <g><rect x="8" y="12" width="128" height="14" rx="7" fill="#0f172a"/><rect x="8" y="74" width="128" height="12" rx="6" fill="#0f172a"/>{[18,44,70,96,122].map((x) => <line key={x} x1={x} y1="14" x2={x} y2="84" stroke="#334155" strokeWidth="5" />)}</g>}
            {stage >= 6 && <g><rect x="-18" y="-8" width="78" height="20" rx="5" fill="#dcfce7" stroke="#166534" strokeWidth="2"/><text x="21" y="6" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="900">MAX 8</text><circle cx="118" cy="8" r="5" fill="#ef4444" className="smoke"/><path d="M124 20 L124 -22" stroke="#0f172a" strokeWidth="4"/><path className="flag-wave" d="M124 -22 L162 -12 L124 -2 Z" fill="#22c55e"/></g>}
          </g>
        )}

        {stage >= 5 && <line x1="230" y1="260" x2="670" y2="260" stroke="#111827" strokeWidth="4" strokeLinecap="round" opacity=".75" />}
        {stage >= 6 && (
          <g>
            <rect x="248" y="214" width="404" height="100" rx="28" fill="#fef08a" opacity=".32" className="success-glow" />
            <text x="450" y="70" textAnchor="middle" fill="#166534" fontSize="30" fontWeight="900">Ferry Complete — Safe River Crossing!</text>
            <g transform="translate(676 306)"><rect x="0" y="0" width="110" height="45" rx="8" fill="#f8fafc" stroke="#14532d" strokeWidth="4"/><text x="55" y="18" textAnchor="middle" fill="#14532d" fontSize="12" fontWeight="900">LOAD LIMIT</text><text x="55" y="35" textAnchor="middle" fill="#14532d" fontSize="16" fontWeight="900">480kg</text></g>
          </g>
        )}
      </svg>
    </div>
  );
}
