import type { ReactElement } from 'react';
import { MISSION_NAMES } from '../footbridge/decisionCatalog';
import { MissionId } from '../footbridge/types';
import { useFootbridgeProject } from '../footbridge/useFootbridgeProject';
import FootbridgeMission1 from './footbridge/FootbridgeMission1';
import FootbridgeMission2 from './footbridge/FootbridgeMission2';
import FootbridgeMission3 from './footbridge/FootbridgeMission3';
import FootbridgeMission4 from './footbridge/FootbridgeMission4';
import FootbridgeMission5 from './footbridge/FootbridgeMission5';
import './footbridge-project-engine.css';

const SAFETY_NOTICE='Educational simulation only. Structural values in this project are fictional learning data and must not be used for real bridge construction. Real bridges require qualified civil/structural engineers and site-specific engineering assessment.';

export default function FootbridgeProjectEngineV2(){
  const c=useFootbridgeProject();
  const {state}=c;
  const s=state.scenario;
  const selectedSite=s.sites.find(site=>site.id===state.selectedSiteId);
  const [missionContent,title,subtitle]=renderMission(c,state.currentMission);

  return <section className="footbridge-project-engine">
    <div className="footbridge-project-topbar"><div><span className="eyebrow">MEZZO VR · COMMUNITY DEVELOPMENT PROJECT</span><h1>Connecting Communities: The Footbridge Challenge</h1><p>Investigate a real-looking community problem, use mathematics to plan a solution and watch your decisions change the virtual project.</p></div><div className="scenario-card"><span>Scenario</span><strong>{s.scenarioId}</strong><small>Seed {s.seed} · Level {s.difficultyLevel}</small><button type="button" onClick={c.startNewScenario}>New community project</button></div></div>
    <div className="simulation-safety-notice"><strong>Educational simulation</strong><span>{SAFETY_NOTICE}</span></div>
    <div className="project-progress-row"><div><span>Project progress</span><strong>{c.progressPercent}%</strong></div><i><b style={{width:`${c.progressPercent}%`}}/></i><small>Autosaved on this device · original attempts and redesign history remain in the project state.</small></div>

    <nav className="mission-roadmap" aria-label="Footbridge project missions">{([1,2,3,4,5,6,7] as MissionId[]).map(id=>{const unlocked=id<=state.highestUnlockedMission;const complete=c.missionComplete(id);return <button key={id} type="button" disabled={!unlocked} className={`${state.currentMission===id?'active':''} ${complete?'complete':''}`} onClick={()=>unlocked&&c.setState(current=>({...current,currentMission:id}))}><span>{id}</span><strong>{MISSION_NAMES[id]}</strong></button>;})}</nav>

    <div className="project-context-strip"><span><b>Current mission:</b> {title}</span><span><b>Site:</b> {selectedSite?.name??'Not yet selected'}</span><span><b>System:</b> {state.selectedBridgeSystem?s.designCards[state.selectedBridgeSystem].name:'Not yet selected'}</span><span><b>Assessed actions:</b> {c.completedCount}/30</span></div>
    <div className="mission-transition-card"><span>{subtitle}</span></div>
    {missionContent}

    <details className="project-notebook"><summary>📘 Project Notebook</summary><div className="notebook-grid">{Object.entries(state.notebook).filter(([,entries])=>entries.length>0).map(([section,entries])=><article key={section}><h3>{section.replace(/_/g,' ')}</h3>{entries.map((entry,index)=><p key={`${section}-${index}`}>{entry}</p>)}</article>)}{Object.values(state.notebook).every(entries=>entries.length===0)&&<p>Your project observations, calculations and decisions will appear here as you work.</p>}</div></details>
  </section>;
}

function renderMission(c:ReturnType<typeof useFootbridgeProject>,mission:MissionId):[ReactElement,string,string]{
  if(mission===1)return [<FootbridgeMission1 c={c}/>,MISSION_NAMES[1],'We have a serious community problem. Investigate it before proposing anything.'];
  if(mission===2)return [<FootbridgeMission2 c={c}/>,MISSION_NAMES[2],'Your community investigation is complete. Collect the field evidence needed for planning.'];
  if(mission===3)return [<FootbridgeMission3 c={c}/>,MISSION_NAMES[3],'The survey is complete. Compare the fictional Mezzo Design Cards and make a reasoned recommendation.'];
  if(mission===4)return [<FootbridgeMission4 c={c}/>,MISSION_NAMES[4],'The planning committee has approved a system. Turn the design into quantities, packages and procurement cost.'];
  if(mission===5)return [<FootbridgeMission5 c={c}/>,MISSION_NAMES[5],'Your materials order is ready. Plan transport, labour and the complete project budget.'];
  if(mission===6)return [<FutureMission title="Construction and inspection" text="Your orders and transport plan are saved. The next build block will make the delivered materials physically match those decisions, then let you inspect the virtual project before testing."/>,MISSION_NAMES[6],'Your materials are on the way. Inspect what actually arrives before construction begins.'];
  return [<FutureMission title="Testing, diagnosis, redesign and reporting" text="Normal-use, peak-use and environmental testing will be driven by the stored project state. Failures will show symptoms first and send the learner into diagnosis and targeted redesign rather than a full restart."/>,MISSION_NAMES[7],'Construction decisions will be tested progressively. Mathematics will determine what happens next.'];
}

function FutureMission({title,text}:{title:string;text:string}){return <div className="project-mission-content"><div className="mission-narrative"><span>Next implementation block</span><h2>{title}</h2><p>{text}</p></div><div className="foundation-summary"><strong>Your current scenario and all previous decisions remain saved.</strong><span>No project data is reset when moving between missions.</span></div></div>;}
