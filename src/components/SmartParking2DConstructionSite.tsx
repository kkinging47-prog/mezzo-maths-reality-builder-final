import { useEffect, useState } from 'react';

type SmartParking2DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const slots = [
  { x: 276, y: 230 },
  { x: 394, y: 230 },
  { x: 512, y: 230 },
  { x: 630, y: 230 },
  { x: 276, y: 348 },
  { x: 394, y: 348 },
  { x: 512, y: 348 },
  { x: 630, y: 348 }
];

const encouragement = [
  'Answer the first maths question to start planning the smart parking system.',
  'Great measuring! The parking land is marked for construction.',
  'Correct! Four parking slots are marked in the first row.',
  'Excellent! The full 8-slot parking layout is complete.',
  'Well done! Slot sensors are installed in every parking space.',
  'Great counting! Parked cars and available spaces are now being calculated.',
  'Smart parking system complete. Click Test Parking System to let a car enter automatically.'
];

function clampStage(stage: number) {
  return Math.max(0, Math.min(6, Math.floor(stage)));
}

function Car({ x, y, color, label }: { x: number; y: number; color: string; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#parkingShadow)">
      <rect x="8" y="18" width="74" height="36" rx="12" fill={color} stroke="#111827" strokeWidth="3" />
      <path d="M22 18 L34 2 H58 L72 18 Z" fill={color} stroke="#111827" strokeWidth="3" />
      <rect x="36" y="7" width="18" height="11" rx="2" fill="#bfdbfe" />
      <circle cx="25" cy="57" r="8" fill="#111827" />
      <circle cx="66" cy="57" r="8" fill="#111827" />
      {label && <text x="45" y="43" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900">{label}</text>}
    </g>
  );
}

function Building({ x, y, title }: { x: number; y: number; title: string }) {
  return (
    <g filter="url(#parkingShadow)">
      <rect x={x} y={y} width="178" height="96" rx="10" fill="#e0f2fe" stroke="#2563eb" strokeWidth="4" />
      <path d={`M${x - 12} ${y + 4} L${x + 89} ${y - 42} L${x + 190} ${y + 4} Z`} fill="#1d4ed8" />
      {[0, 1, 2, 3].map((n) => (
        <rect key={n} x={x + 20 + n * 36} y={y + 24} width="22" height="20" rx="3" fill="#93c5fd" />
      ))}
      <rect x={x + 74} y={y + 54} width="30" height="42" rx="4" fill="#1e3a8a" />
      <text x={x + 89} y={y + 120} textAnchor="middle" fill="#1e3a8a" fontSize="18" fontWeight="900">{title}</text>
    </g>
  );
}

function Sensor({ x, y, occupied }: { x: number; y: number; occupied: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill={occupied ? '#ef4444' : '#22c55e'} stroke="#f8fafc" strokeWidth="3" />
      <circle cx={x} cy={y} r="16" fill="none" stroke={occupied ? '#fca5a5' : '#86efac'} strokeWidth="3" opacity=".55" className="sensor-pulse" />
    </g>
  );
}

export default function SmartParking2DConstructionSite({ buildStage, feedback }: SmartParking2DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) {
      setTesting(false);
    }
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : encouragement[stage];
  const parkedCars = stage >= 6 ? (testing ? 7 : 6) : stage >= 5 ? 5 : 0;
  const available = Math.max(0, 8 - parkedCars);

  return (
    <div className="parking-site" aria-label={`Smart car parking construction site stage ${stage} of 6`}>
      <div className="parking-site__header">
        <div>
          <p className="parking-site__eyebrow">Smart Parking System Lab</p>
          <h2>Build a Smart Car Parking System</h2>
          <p>{visibleFeedback}</p>
        </div>
        <div className="parking-site__status">Stage {stage} of 6</div>
      </div>

      <div className="parking-site__canvas">
        <svg viewBox="0 0 980 600" role="img" aria-label="A realistic smart car parking system being built step by step">
          <style>{`
            @keyframes sensorPulse { 0%,100% { opacity: .28; transform: scale(.88); } 50% { opacity: .95; transform: scale(1.08); } }
            @keyframes barrierLift { 0%,100% { transform: rotate(0deg); } 45%,75% { transform: rotate(-58deg); } }
            @keyframes trafficBlink { 0%,49% { opacity: .35; } 50%,100% { opacity: 1; } }
            @keyframes carEnterPark { 0% { transform: translate(0,0); } 45% { transform: translate(190px,0); } 70% { transform: translate(338px,-58px); } 100% { transform: translate(456px,-118px); } }
            @keyframes popInParking { from { opacity: 0; transform: scale(.86); transform-origin: center; } to { opacity: 1; transform: scale(1); } }
            .sensor-pulse { animation: sensorPulse 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
            .barrier-arm.test { animation: barrierLift 4.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 0 50%; }
            .green-light { animation: trafficBlink 1s ease-in-out infinite alternate; }
            .parking-pop { animation: popInParking .45s ease-out both; }
            .test-car { animation: carEnterPark 4.4s ease-in-out infinite alternate; }
          `}</style>

          <defs>
            <linearGradient id="parkingSky" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="72%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#dcfce7" />
            </linearGradient>
            <linearGradient id="asphalt" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            <filter id="parkingShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.23" />
            </filter>
          </defs>

          <rect width="980" height="600" fill="url(#parkingSky)" />
          <circle cx="872" cy="72" r="38" fill="#fde047" opacity=".95" />
          <path d="M0 190 C100 160 222 185 334 158 C470 126 580 166 706 144 C808 126 900 142 980 118 L980 600 L0 600 Z" fill="#86efac" />
          <path d="M0 444 C116 404 250 438 358 400 C488 354 606 420 742 382 C832 356 910 374 980 348 L980 600 L0 600 Z" fill="#4ade80" opacity=".55" />

          <Building x={56} y={98} title="COMMUNITY CENTRE" />
          <Building x={746} y={124} title="SHOPPING BLOCK" />

          <g>
            <rect x="0" y="492" width="980" height="108" fill="#334155" />
            <line x1="0" y1="544" x2="980" y2="544" stroke="#facc15" strokeWidth="6" strokeDasharray="26 22" />
            <text x="123" y="474" fill="#0f172a" fontSize="18" fontWeight="900">Cars waiting at entrance road</text>
            <Car x={64} y={512} color="#ef4444" />
            <Car x={170} y={512} color="#f59e0b" />
          </g>

          <g filter="url(#parkingShadow)">
            <rect x="230" y="196" width="528" height="282" rx="18" fill="url(#asphalt)" stroke="#0f172a" strokeWidth="6" />
            <text x="494" y="184" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">empty parking land: 20m × 10m</text>
          </g>

          {stage >= 1 && (
            <g className="parking-pop">
              <rect x="230" y="196" width="528" height="282" rx="18" fill="none" stroke="#facc15" strokeWidth="8" strokeDasharray="18 12" />
              {[{x:230,y:196},{x:758,y:196},{x:230,y:478},{x:758,y:478}].map((peg) => (
                <g key={`${peg.x}-${peg.y}`}>
                  <circle cx={peg.x} cy={peg.y} r="10" fill="#ef4444" stroke="#7f1d1d" strokeWidth="3" />
                  <line x1={peg.x} y1={peg.y} x2={peg.x} y2={peg.y + 34} stroke="#7f1d1d" strokeWidth="4" />
                </g>
              ))}
              <text x="494" y="508" textAnchor="middle" fill="#854d0e" fontSize="19" fontWeight="900">Parking boundary measured: 200m²</text>
            </g>
          )}

          {stage >= 2 && (
            <g className="parking-pop" stroke="#f8fafc" strokeWidth="5" fill="none" strokeLinecap="round">
              {slots.slice(0, 4).map((slot) => <rect key={`${slot.x}-${slot.y}`} x={slot.x} y={slot.y} width="96" height="82" rx="8" />)}
              <text x="494" y="222" textAnchor="middle" fill="#fef3c7" fontSize="18" fontWeight="900">4 parking slots fit in one row</text>
            </g>
          )}

          {stage >= 3 && (
            <g className="parking-pop" stroke="#f8fafc" strokeWidth="5" fill="none" strokeLinecap="round">
              {slots.map((slot) => <rect key={`${slot.x}-${slot.y}`} x={slot.x} y={slot.y} width="96" height="82" rx="8" />)}
              <line x1="250" y1="337" x2="738" y2="337" stroke="#facc15" strokeWidth="5" strokeDasharray="22 14" />
              <text x="494" y="464" textAnchor="middle" fill="#fef3c7" fontSize="18" fontWeight="900">2 rows × 4 slots = 8 spaces</text>
            </g>
          )}

          {stage >= 4 && (
            <g className="parking-pop">
              {slots.map((slot, index) => <Sensor key={index} x={slot.x + 48} y={slot.y + 41} occupied={index < parkedCars} />)}
              <text x="494" y="156" textAnchor="middle" fill="#065f46" fontSize="20" fontWeight="900">Sensors installed in all 8 parking spaces</text>
            </g>
          )}

          {stage >= 5 && (
            <g className="parking-pop">
              {slots.slice(0, parkedCars).map((slot, index) => (
                <Car key={index} x={slot.x + 2} y={slot.y + 10} color={['#2563eb', '#dc2626', '#f59e0b', '#7c3aed', '#059669', '#ea580c', '#0f766e'][index % 7]} label={`${index + 1}`} />
              ))}
              <rect x="790" y="274" width="128" height="88" rx="12" fill="#0f172a" stroke="#22c55e" strokeWidth="5" />
              <text x="854" y="305" textAnchor="middle" fill="#bbf7d0" fontSize="16" fontWeight="900">COUNTER</text>
              <text x="854" y="342" textAnchor="middle" fill="#22c55e" fontSize="28" fontWeight="900">{available}</text>
              <text x="854" y="360" textAnchor="middle" fill="#e0f2fe" fontSize="13" fontWeight="800">spaces free</text>
            </g>
          )}

          {stage >= 6 && (
            <g className="parking-pop">
              <rect x="348" y="72" width="292" height="76" rx="15" fill="#020617" stroke="#38bdf8" strokeWidth="6" filter="url(#parkingShadow)" />
              <text x="494" y="104" textAnchor="middle" fill="#67e8f9" fontSize="18" fontWeight="900">SMART PARKING DISPLAY</text>
              <text x="494" y="134" textAnchor="middle" fill="#22c55e" fontSize="24" fontWeight="900">{available} SPACES AVAILABLE</text>

              <g transform="translate(295 480)">
                <rect x="0" y="0" width="38" height="72" rx="7" fill="#111827" />
                <circle cx="19" cy="17" r="9" fill="#ef4444" opacity={testing ? '.25' : '1'} />
                <circle cx="19" cy="37" r="9" fill="#facc15" opacity=".35" />
                <circle cx="19" cy="57" r="9" fill="#22c55e" className={testing ? 'green-light' : ''} opacity={testing ? '1' : '.35'} />
              </g>
              <g transform="translate(340 503)">
                <rect x="0" y="0" width="18" height="76" rx="5" fill="#111827" />
                <rect className={testing ? 'barrier-arm test' : 'barrier-arm'} x="12" y="5" width="168" height="14" rx="7" fill="#f8fafc" stroke="#ef4444" strokeWidth="4" />
              </g>

              {testing && <g className="test-car"><Car x="52" y="512" color="#14b8a6" label="IN" /></g>}
            </g>
          )}
        </svg>
      </div>

      <div className="parking-site__footer">
        <p className={stage >= 6 && testing ? 'parking-site__feedback complete' : 'parking-site__feedback'}>
          {stage >= 6 && testing
            ? 'Test passed: the display counted available spaces, the barrier opened, and the car parked automatically.'
            : visibleFeedback}
        </p>
        {stage >= 6 && (
          <button type="button" className="parking-test-btn" onClick={() => setTesting((current) => !current)}>
            {testing ? 'Reset Parking Test' : 'Test Parking System'}
          </button>
        )}
      </div>

      <style>{`
        .parking-site{font-family:Inter,system-ui,sans-serif;color:#0f172a}.parking-site__header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;margin-bottom:1rem}.parking-site__eyebrow{margin:0 0 .35rem;color:#0369a1;font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:.78rem}.parking-site h2{margin:.1rem 0 .35rem;font-size:clamp(1.35rem,3vw,2.05rem)}.parking-site__header p:last-child{margin:0;max-width:56rem;color:#334155;font-weight:700}.parking-site__status{background:#e0f2fe;border:2px solid #38bdf8;color:#075985;border-radius:999px;padding:.75rem 1rem;font-weight:900;white-space:nowrap}.parking-site__canvas{background:#e0f2fe;border:4px solid #bae6fd;border-radius:24px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(15,23,42,.08)}.parking-site svg{display:block;width:100%;height:auto;min-height:360px}.parking-site__footer{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem}.parking-site__feedback{margin:0;flex:1;background:#ecfeff;border:2px solid #67e8f9;color:#155e75;border-radius:18px;padding:1rem;font-weight:900}.parking-site__feedback.complete{background:#f0fdf4;border-color:#22c55e;color:#166534}.parking-test-btn{border:0;border-radius:18px;background:#0f172a;color:white;font-weight:900;padding:1rem 1.15rem;box-shadow:0 12px 24px rgba(15,23,42,.18);cursor:pointer}.parking-test-btn:hover{transform:translateY(-1px)}@media(max-width:720px){.parking-site__header,.parking-site__footer{flex-direction:column;align-items:stretch}.parking-site__status{border-radius:16px}.parking-site svg{min-height:280px}}
      `}</style>
    </div>
  );
}
