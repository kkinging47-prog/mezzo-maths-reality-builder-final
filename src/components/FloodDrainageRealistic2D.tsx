import { useEffect, useState } from 'react';

type Props = { buildStage: number; feedback?: string };

const notes = [
  'Start the community road drainage upgrade.',
  'Old gutter depth measured.',
  'Wider side gutters marked outside the road.',
  'Deeper side gutters excavated.',
  'Road raised above the water channels.',
  'Concrete gutter walls and covers completed.',
  'System ready. Run the rain test.'
];

const clamp = (value: number) => Math.max(0, Math.min(6, Math.floor(value)));

function House({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g filter="url(#shadow)">
      <rect x={x} y={y} width="108" height="72" rx="8" fill={fill} stroke="#334155" strokeWidth="3" />
      <path d={`M${x - 8} ${y + 4} L${x + 54} ${y - 38} L${x + 116} ${y + 4} Z`} fill="#b91c1c" />
      <rect x={x + 42} y={y + 34} width="24" height="38" rx="4" fill="#78350f" />
      <rect x={x + 14} y={y + 20} width="22" height="17" rx="3" fill="#dbeafe" />
      <rect x={x + 74} y={y + 20} width="22" height="17" rx="3" fill="#dbeafe" />
    </g>
  );
}

function Car({ x, y, fill }: { x: number | string; y: number | string; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#shadow)">
      <rect x="6" y="18" width="78" height="34" rx="12" fill={fill} stroke="#111827" strokeWidth="3" />
      <path d="M20 18 L34 2 H58 L72 18 Z" fill={fill} stroke="#111827" strokeWidth="3" />
      <rect x="35" y="7" width="20" height="10" rx="2" fill="#dbeafe" />
      <circle cx="26" cy="54" r="7" fill="#111827" />
      <circle cx="66" cy="54" r="7" fill="#111827" />
    </g>
  );
}

export default function FloodDrainageRealistic2D({ buildStage, feedback }: Props) {
  const stage = clamp(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const roadY = stage >= 4 ? 300 : 314;
  const roadH = 112;
  const topDrainY = stage >= 4 ? 208 : 226;
  const bottomDrainY = stage >= 4 ? 458 : 472;
  const drainH = stage >= 3 ? 78 : 44;
  const drainX = stage >= 2 ? 64 : 108;
  const drainW = stage >= 2 ? 852 : 764;
  const message = feedback && !feedback.includes('Not quite') ? feedback : notes[stage];

  return (
    <div className="drainage-realistic" aria-label={`Flood-safe road stage ${stage} of 6`}>
      <div className="drainage-realistic__header">
        <div>
          <p className="drainage-realistic__eyebrow">Flood-Safe Road & Drainage Upgrade</p>
          <h2>Raise the Road and Upgrade the Gutters</h2>
          <p>{message}</p>
        </div>
        <strong>Stage {stage} of 6</strong>
      </div>

      <div className="drainage-realistic__canvas">
        <svg viewBox="0 0 980 640" role="img" aria-label="Road in the middle with gutters outside both road edges">
          <style>{`
            @keyframes rain{from{transform:translateY(-70px)}to{transform:translateY(70px)}}
            @keyframes flow{to{stroke-dashoffset:-120}}
            @keyframes drive{from{transform:translateX(-140px)}to{transform:translateX(1040px)}}
            @keyframes fade{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
            .rain{animation:rain 1.2s linear infinite}.flow{stroke-dasharray:28 16;animation:flow 1.5s linear infinite}.drive{animation:drive 6s linear infinite}.new{animation:fade .45s ease-out both}
          `}</style>
          <defs>
            <linearGradient id="sky2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#94a3b8"/><stop offset="55%" stopColor="#cbd5e1"/><stop offset="100%" stopColor="#dcfce7"/></linearGradient>
            <linearGradient id="road2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#64748b"/><stop offset="100%" stopColor="#1f2937"/></linearGradient>
            <linearGradient id="water2" x1="0" x2="1"><stop offset="0%" stopColor="#38bdf8"/><stop offset="100%" stopColor="#0284c7"/></linearGradient>
            <filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#0f172a" floodOpacity=".24"/></filter>
          </defs>

          <rect width="980" height="640" fill="url(#sky2)" />
          <path d="M0 160 C120 130 250 166 386 132 C535 96 650 148 804 112 C886 92 932 100 980 86 L980 640 L0 640 Z" fill="#86efac" />
          <path d="M0 502 C124 460 250 502 372 474 C500 444 640 500 770 466 C858 444 930 462 980 430 L980 640 L0 640 Z" fill="#4ade80" opacity=".55" />

          <g className="rain" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" opacity=".85">
            {Array.from({ length: 24 }, (_, i) => <line key={i} x1={28 + i * 42} y1="-44" x2={8 + i * 42} y2="20" />)}
            {Array.from({ length: 24 }, (_, i) => <line key={`b${i}`} x1={12 + i * 42} y1="56" x2={-8 + i * 42} y2="120" />)}
          </g>

          <House x={88} y={112} fill="#fde68a" />
          <House x={244} y={88} fill="#bfdbfe" />
          <House x={738} y={98} fill="#fecaca" />
          <House x={822} y={526} fill="#bbf7d0" />
          <text x="490" y="48" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0f172a">homes and shops are beyond the gutter line</text>

          {stage === 0 && (
            <g>
              <rect x="96" y="240" width="788" height="26" rx="13" fill="#38bdf8" opacity=".5" />
              <rect x="96" y="466" width="788" height="26" rx="13" fill="#38bdf8" opacity=".5" />
              <path d="M90 276 C240 306 340 284 488 324 C624 360 760 310 898 342" stroke="#38bdf8" strokeWidth="28" strokeLinecap="round" fill="none" opacity=".42" />
              <path d="M90 418 C250 386 365 444 506 414 C640 388 760 430 898 400" stroke="#38bdf8" strokeWidth="24" strokeLinecap="round" fill="none" opacity=".34" />
              <path d="M118 316 C250 292 368 352 508 330 C650 308 760 352 884 326" stroke="#e0f2fe" strokeWidth="8" fill="none" className="flow" />
              <text x="490" y="588" textAnchor="middle" fontSize="23" fontWeight="900" fill="#075985">old shallow gutters overflow toward the road</text>
            </g>
          )}

          {stage >= 2 && (
            <g className="new" filter="url(#shadow)">
              <rect x={drainX} y={topDrainY} width={drainW} height={drainH} rx="14" fill={stage >= 5 ? '#94a3b8' : stage >= 3 ? '#451a03' : '#92400e'} stroke={stage >= 5 ? '#475569' : '#78350f'} strokeWidth="5" />
              <rect x={drainX} y={bottomDrainY} width={drainW} height={drainH} rx="14" fill={stage >= 5 ? '#94a3b8' : stage >= 3 ? '#451a03' : '#92400e'} stroke={stage >= 5 ? '#475569' : '#78350f'} strokeWidth="5" />
              {stage >= 5 && <><rect x={drainX + 28} y={topDrainY + 14} width={drainW - 56} height={drainH - 28} rx="10" fill="url(#water2)"/><rect x={drainX + 28} y={bottomDrainY + 14} width={drainW - 56} height={drainH - 28} rx="10" fill="url(#water2)"/></>}
              {stage >= 6 && Array.from({ length: 18 }, (_, i) => <g key={i}><rect x={drainX + 36 + i * 44} y={topDrainY + 2} width="12" height={drainH - 4} rx="4" fill="#475569"/><rect x={drainX + 36 + i * 44} y={bottomDrainY + 2} width="12" height={drainH - 4} rx="4" fill="#475569"/></g>)}
            </g>
          )}

          {stage >= 2 && <><rect x="52" y={roadY - 34} width="876" height="28" rx="10" fill="#94a3b8" stroke="#64748b" strokeWidth="3"/><rect x="52" y={roadY + roadH} width="876" height="28" rx="10" fill="#94a3b8" stroke="#64748b" strokeWidth="3"/></>}

          <g filter="url(#shadow)">
            <rect x="50" y={roadY} width="880" height={roadH} rx="18" fill="url(#road2)" stroke={stage >= 4 ? '#f8fafc' : '#334155'} strokeWidth={stage >= 4 ? 6 : 3}/>
            <line x1="76" y1={roadY + roadH / 2} x2="904" y2={roadY + roadH / 2} stroke="#facc15" strokeWidth="6" strokeDasharray="34 25" />
          </g>
          <text x="490" y={roadY - 50} textAnchor="middle" fontSize="20" fontWeight="900" fill="#0f172a">{stage >= 4 ? 'raised road: cars stay above the side gutters' : 'road is in the middle; gutters sit outside the road'}</text>

          {stage >= 1 && <g className="new"><line x1="132" y1="225" x2="132" y2="272" stroke="#fef08a" strokeWidth="5"/><line x1="132" y1="458" x2="132" y2="534" stroke="#fef08a" strokeWidth="5"/><text x="198" y="206" fontSize="16" fontWeight="900" fill="#854d0e">old depth 40cm</text><text x="200" y="558" fontSize="16" fontWeight="900" fill="#854d0e">new depth 90cm</text></g>}
          {stage >= 2 && <text x="490" y="192" textAnchor="middle" fontSize="18" fontWeight="900" fill="#854d0e">wider gutters are outside both road edges</text>}
          {stage >= 3 && <text x="490" y="550" textAnchor="middle" fontSize="18" fontWeight="900" fill="#7c2d12">deep gutter section: 100cm × 90cm</text>}
          {stage >= 6 && <g><rect x="382" y="112" width="216" height="52" rx="12" fill="#dcfce7" stroke="#16a34a" strokeWidth="4"/><text x="490" y="145" textAnchor="middle" fill="#166534" fontSize="18" fontWeight="900">FLOOD-SAFE ROAD</text></g>}

          {stage >= 4 && <><Car x={210} y={roadY + 24} fill="#3b82f6"/><Car x={650} y={roadY + 25} fill="#f97316"/></>}

          {stage >= 6 && testing && <g><path d={`M${drainX + 40} ${topDrainY + drainH / 2} C${drainX + 190} ${topDrainY + 18} ${drainX + 340} ${topDrainY + 62} ${drainX + 500} ${topDrainY + drainH / 2} S${drainX + 714} ${topDrainY + 18} ${drainX + drainW - 44} ${topDrainY + drainH / 2}`} stroke="#7dd3fc" strokeWidth="14" strokeLinecap="round" fill="none" className="flow"/><path d={`M${drainX + 40} ${bottomDrainY + drainH / 2} C${drainX + 190} ${bottomDrainY + 18} ${drainX + 340} ${bottomDrainY + 62} ${drainX + 500} ${bottomDrainY + drainH / 2} S${drainX + 714} ${bottomDrainY + 18} ${drainX + drainW - 44} ${bottomDrainY + drainH / 2}`} stroke="#7dd3fc" strokeWidth="14" strokeLinecap="round" fill="none" className="flow"/><g className="drive"><Car x="0" y={roadY + 25} fill="#22c55e"/></g><text x="490" y="610" textAnchor="middle" fill="#166534" fontSize="26" fontWeight="900">water stays in the gutters; cars drive safely on the raised road</text></g>}
        </svg>
      </div>

      {stage >= 6 && <button className="drainage-realistic__test" type="button" onClick={() => setTesting((value) => !value)}>{testing ? 'Reset Heavy Rain Test' : 'Test Heavy Rain'}</button>}

      <style>{`.drainage-realistic{font-family:Inter,system-ui,sans-serif;color:#0f172a}.drainage-realistic__header{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem}.drainage-realistic__eyebrow{margin:0 0 .25rem;color:#0369a1;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:.82rem}.drainage-realistic h2{margin:.1rem 0 .35rem;font-size:clamp(1.3rem,3vw,2.1rem)}.drainage-realistic p{margin:0;font-weight:700;color:#334155}.drainage-realistic strong{background:#e0f2fe;border:2px solid #38bdf8;border-radius:999px;padding:.7rem 1rem;color:#075985;white-space:nowrap}.drainage-realistic__canvas{border-radius:24px;overflow:hidden;border:4px solid #bae6fd;background:#e0f2fe}.drainage-realistic svg{display:block;width:100%;height:auto;min-height:380px}.drainage-realistic__test{margin-top:1rem;width:100%;border:0;border-radius:18px;background:linear-gradient(135deg,#0284c7,#16a34a);color:white;font-weight:1000;font-size:1rem;padding:1rem 1.25rem;cursor:pointer}@media(max-width:720px){.drainage-realistic__header{flex-direction:column}.drainage-realistic strong{border-radius:16px}.drainage-realistic svg{min-height:320px}}`}</style>
    </div>
  );
}
