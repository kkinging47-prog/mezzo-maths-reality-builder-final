import { useEffect, useState } from 'react';

type FloodDrainage2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const messages = [
  'Answer the first maths question to begin the community drainage upgrade.',
  'Old gutter depth measured and marked.',
  'Wider gutter lines are marked on both sides of the road.',
  'Deeper trenches are excavated to carry more rainwater.',
  'The road level is raised above the water path.',
  'Concrete drain walls are built on both sides of the road.',
  'Drainage upgrade complete. Click Test Heavy Rain to check the system.'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

function House({ x, y, wall, roof }: { x: number; y: number; wall: string; roof: string }) {
  return (
    <g filter="url(#shadow)">
      <rect x={x} y={y} width="112" height="76" rx="8" fill={wall} stroke="#475569" strokeWidth="3" />
      <path d={`M${x - 10} ${y + 4} L${x + 56} ${y - 42} L${x + 122} ${y + 4} Z`} fill={roof} />
      <rect x={x + 44} y={y + 34} width="26" height="42" rx="4" fill="#78350f" />
      <rect x={x + 14} y={y + 20} width="22" height="18" rx="3" fill="#bfdbfe" />
      <rect x={x + 78} y={y + 20} width="22" height="18" rx="3" fill="#bfdbfe" />
    </g>
  );
}

function Car({ x, y, color }: { x: number | string; y: number | string; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#shadow)">
      <rect x="6" y="16" width="70" height="34" rx="11" fill={color} stroke="#111827" strokeWidth="3" />
      <path d="M18 16 L30 0 H54 L66 16 Z" fill={color} stroke="#111827" strokeWidth="3" />
      <rect x="32" y="5" width="18" height="10" rx="2" fill="#dbeafe" />
      <circle cx="23" cy="52" r="7" fill="#111827" />
      <circle cx="61" cy="52" r="7" fill="#111827" />
    </g>
  );
}

function Worker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="10" fill="#7c2d12" />
      <path d="M-12 -8 h24 l-5 -12 h-14 Z" fill="#facc15" />
      <rect x="-8" y="10" width="16" height="30" rx="6" fill="#2563eb" />
      <line x1="-8" y1="38" x2="-20" y2="56" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
      <line x1="8" y1="38" x2="20" y2="56" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export default function FloodDrainage2DConstructionSite({ buildStage, feedback }: FloodDrainage2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const roadY = stage >= 4 ? 258 : 276;
  const roadHeight = stage >= 4 ? 132 : 112;
  const drainY = stage >= 4 ? 226 : 252;
  const drainH = stage >= 3 ? 118 : 54;
  const drainW = stage >= 2 ? 90 : 48;
  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : messages[stage];

  return (
    <div className="drainage-site" aria-label={`Flood-safe road and drainage upgrade stage ${stage} of 6`}>
      <div className="drainage-site__header">
        <div>
          <p className="drainage-site__eyebrow">Flood-Safe Road & Drainage Upgrade</p>
          <h2>Raise the Road and Upgrade the Gutters</h2>
          <p>{visibleFeedback}</p>
        </div>
        <div className="drainage-site__status">Stage {stage} of 6</div>
      </div>

      <div className="drainage-site__canvas">
        <svg viewBox="0 0 980 620" role="img" aria-label="Community road drainage upgrade simulation">
          <style>{`
            @keyframes rainFall { from { transform: translateY(-72px); } to { transform: translateY(72px); } }
            @keyframes waterMove { to { stroke-dashoffset: -90; } }
            @keyframes popIn { from { opacity: 0; transform: scale(.86); transform-origin: center; } to { opacity: 1; transform: scale(1); } }
            @keyframes carDrive { from { transform: translateX(-130px); } to { transform: translateX(1040px); } }
            @keyframes glow { 0%,100% { opacity: .24; } 50% { opacity: .66; } }
            .rain { animation: rainFall 1.2s linear infinite; }
            .flow { stroke-dasharray: 24 14; animation: waterMove 1.8s linear infinite; }
            .pop { animation: popIn .48s ease-out both; }
            .safe-car { animation: carDrive 6s linear infinite; }
            .glow { animation: glow 1.6s ease-in-out infinite; }
          `}</style>

          <defs>
            <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#94a3b8" /><stop offset="58%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#dcfce7" /></linearGradient>
            <linearGradient id="road" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#64748b" /><stop offset="100%" stopColor="#1f2937" /></linearGradient>
            <linearGradient id="water" x1="0" x2="1"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#0284c7" /></linearGradient>
            <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0f172a" floodOpacity="0.24" /></filter>
          </defs>

          <rect width="980" height="620" fill="url(#sky)" />
          <path d="M0 188 C124 150 262 180 398 142 C528 106 648 155 792 118 C872 98 930 106 980 92 L980 620 L0 620 Z" fill="#86efac" />
          <path d="M0 430 C130 388 230 434 354 398 C494 358 610 420 748 382 C850 354 910 372 980 342 L980 620 L0 620 Z" fill="#4ade80" opacity=".55" />

          <g className="rain" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" opacity=".85">
            {Array.from({ length: 23 }, (_, i) => <line key={i} x1={36 + i * 42} y1="-42" x2={18 + i * 42} y2="20" />)}
            {Array.from({ length: 23 }, (_, i) => <line key={`b-${i}`} x1={20 + i * 42} y1="54" x2={2 + i * 42} y2="116" />)}
          </g>

          <House x={72} y={150} wall="#fde68a" roof="#b91c1c" />
          <House x={218} y={108} wall="#bfdbfe" roof="#7c3aed" />
          <House x={738} y={128} wall="#fecaca" roof="#dc2626" />
          <House x={842} y={248} wall="#bbf7d0" roof="#15803d" />
          <text x="146" y="264" textAnchor="middle" fill="#7f1d1d" fontSize="16" fontWeight="900">homes near road</text>
          <text x="828" y="374" textAnchor="middle" fill="#065f46" fontSize="16" fontWeight="900">shops protected</text>

          <g filter="url(#shadow)">
            <rect x="40" y={roadY} width="900" height={roadHeight} rx="16" fill="url(#road)" />
            <line x1="58" y1={roadY + roadHeight / 2} x2="922" y2={roadY + roadHeight / 2} stroke="#facc15" strokeWidth="6" strokeDasharray="32 24" />
            <text x="490" y={roadY - 16} textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">{stage >= 4 ? 'Raised road surface: +30cm' : 'Existing low road with shallow side gutters'}</text>
          </g>

          {stage === 0 && (
            <g>
              <path d="M58 276 C230 330 390 252 520 310 C650 368 820 286 930 328 L930 418 C760 390 618 448 480 390 C320 324 184 406 58 360 Z" fill="#38bdf8" opacity=".58" />
              <path d="M92 404 C240 378 318 438 472 416 C628 394 742 446 910 410" fill="none" stroke="#e0f2fe" strokeWidth="8" strokeDasharray="28 16" opacity=".85" className="flow" />
              <text x="490" y="464" textAnchor="middle" fill="#075985" fontSize="24" fontWeight="900">shallow gutters overflow onto the road</text>
            </g>
          )}

          {stage >= 1 && <g className="pop"><line x1="118" y1="408" x2="118" y2="450" stroke="#fef08a" strokeWidth="5" /><text x="140" y="394" textAnchor="middle" fill="#854d0e" fontSize="18" fontWeight="900">old depth: 40cm</text><line x1="860" y1="406" x2="860" y2="456" stroke="#fef08a" strokeWidth="5" /><text x="820" y="394" textAnchor="middle" fill="#854d0e" fontSize="18" fontWeight="900">new depth: 90cm</text></g>}

          {stage >= 2 && <g className="pop"><rect x="48" y={drainY} width={drainW} height={drainH} rx="10" fill="#92400e" opacity=".86" /><rect x={932 - drainW} y={drainY} width={drainW} height={drainH} rx="10" fill="#92400e" opacity=".86" /><text x="490" y="218" textAnchor="middle" fill="#854d0e" fontSize="20" fontWeight="900">wider gutter outlines marked on both sides: 100cm each</text></g>}

          {stage >= 3 && <g className="pop" filter="url(#shadow)"><rect x="46" y="218" width="98" height="134" rx="12" fill="#451a03" /><rect x="836" y="218" width="98" height="134" rx="12" fill="#451a03" /><text x="490" y="206" textAnchor="middle" fill="#7c2d12" fontSize="20" fontWeight="900">deep gutters: 100cm × 90cm = 9000cm²</text></g>}

          {stage >= 5 && <g className="pop" filter="url(#shadow)"><rect x="46" y="218" width="98" height="134" rx="12" fill="#94a3b8" stroke="#475569" strokeWidth="5" /><rect x="836" y="218" width="98" height="134" rx="12" fill="#94a3b8" stroke="#475569" strokeWidth="5" /><rect x="64" y="236" width="62" height="98" rx="8" fill="url(#water)" /><rect x="854" y="236" width="62" height="98" rx="8" fill="url(#water)" /><path d="M68 256 C86 244 104 270 124 256" fill="none" stroke="#e0f2fe" strokeWidth="5" className="flow" /><path d="M858 256 C876 244 894 270 914 256" fill="none" stroke="#e0f2fe" strokeWidth="5" className="flow" />{stage >= 6 && <g>{[58,86,114,858,886,914].map((x) => <rect key={x} x={x} y="210" width="14" height="146" rx="5" fill="#475569" opacity=".78" />)}<rect x="184" y="198" width="196" height="54" rx="12" fill="#dcfce7" stroke="#16a34a" strokeWidth="4" /><text x="282" y="232" textAnchor="middle" fill="#166534" fontSize="18" fontWeight="900">FLOOD-SAFE ROAD</text></g>}</g>}

          {stage >= 6 && testing && <g><rect x="28" y="196" width="924" height="188" rx="28" fill="#bbf7d0" opacity=".3" className="glow" /><path d="M94 236 C100 284 94 308 98 342" fill="none" stroke="#7dd3fc" strokeWidth="14" strokeLinecap="round" className="flow" /><path d="M888 236 C880 284 886 308 882 342" fill="none" stroke="#7dd3fc" strokeWidth="14" strokeLinecap="round" className="flow" /><g className="safe-car"><Car x="0" y={roadY + 26} color="#22c55e" /></g><text x="490" y="504" textAnchor="middle" fill="#166534" fontSize="30" fontWeight="900">Heavy rain test passed — homes and properties protected!</text></g>}

          <Worker x={380} y={502} />
          <Worker x={612} y={502} />
          <rect x="430" y="490" width="54" height="32" rx="6" fill="#f59e0b" stroke="#92400e" strokeWidth="3" />
          <rect x="500" y="488" width="72" height="18" rx="5" fill="#94a3b8" />
          <text x="490" y="568" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="900">civil engineering team and construction materials</text>
        </svg>
      </div>

      {stage >= 6 && <button className="drainage-site__test" type="button" onClick={() => setTesting((current) => !current)}>{testing ? 'Reset Heavy Rain Test' : 'Test Heavy Rain'}</button>}

      <style>{`
        .drainage-site{font-family:Inter,system-ui,sans-serif;color:#0f172a}.drainage-site__header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem}.drainage-site__eyebrow{margin:0 0 .25rem;color:#0369a1;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:.82rem}.drainage-site h2{margin:.1rem 0 .35rem;font-size:clamp(1.3rem,3vw,2.1rem)}.drainage-site p{margin:0;font-weight:700;color:#334155}.drainage-site__status{background:#e0f2fe;border:2px solid #38bdf8;border-radius:999px;padding:.7rem 1rem;font-weight:900;color:#075985;white-space:nowrap}.drainage-site__canvas{border-radius:24px;overflow:hidden;border:4px solid #bae6fd;background:#e0f2fe;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.drainage-site svg{display:block;width:100%;height:auto;min-height:360px}.drainage-site__test{margin-top:1rem;width:100%;border:0;border-radius:18px;background:linear-gradient(135deg,#0284c7,#16a34a);color:#fff;font-weight:1000;font-size:1rem;padding:1rem 1.25rem;cursor:pointer;box-shadow:0 14px 30px rgba(2,132,199,.25)}.drainage-site__test:hover{filter:brightness(1.05);transform:translateY(-1px)}@media(max-width:720px){.drainage-site__header{flex-direction:column}.drainage-site__status{border-radius:16px}.drainage-site svg{min-height:300px}}
      `}</style>
    </div>
  );
}
