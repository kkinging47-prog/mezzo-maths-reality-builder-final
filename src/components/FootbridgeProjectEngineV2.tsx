import type { ReactElement } from 'react';
import { MissionId } from '../footbridge/types';
import { useFootbridgeProject } from '../footbridge/useFootbridgeProject';
import FootbridgeMission1 from './footbridge/FootbridgeMission1';
import FootbridgeMission2 from './footbridge/FootbridgeMission2';
import FootbridgeMission3 from './footbridge/FootbridgeMission3';
import FootbridgeMission4 from './footbridge/FootbridgeMission4';
import FootbridgeMission5 from './footbridge/FootbridgeMission5';
import FootbridgeMission6 from './footbridge/FootbridgeMission6';
import FootbridgeMission7 from './footbridge/FootbridgeMission7';
import './footbridge-project-engine.css';
import './footbridge-kid-adventure.css';

const SAFETY_NOTICE='Educational simulation only. Structural values in this project are fictional learning data and must not be used for real bridge construction. Real bridges require qualified civil/structural engineers and site-specific engineering assessment.';

const LEARNER_MISSIONS: Record<MissionId,{icon:string;title:string;short:string;guide:string}> = {
  1:{icon:'🏘️',title:'Meet the Communities',short:'Find out what Adom and Nkabom need',guide:'Ama says: “Come and meet the people first. We need to understand the problem before we build anything!”'},
  2:{icon:'🌊',title:'Explore the River',short:'Choose a crossing and measure it',guide:'Kojo says: “Grab your measuring tools. The river has clues we need before we can plan the bridge.”'},
  3:{icon:'🧩',title:'Choose Your Bridge',short:'Compare three bridge ideas',guide:'Ama says: “There is more than one way to solve this. Which bridge idea fits our community best?”'},
  4:{icon:'📦',title:'Get the Materials',short:'Work out what the project needs',guide:'Kojo says: “Time to turn your maths into real things! Every number you calculate changes what we can buy.”'},
  5:{icon:'🚚',title:'Plan Money & Deliveries',short:'Move materials and watch the money',guide:'Ama says: “Can we get everything to the river without running out of money? Your calculations decide!”'},
  6:{icon:'🛠️',title:'Build & Check',short:'See what your maths created',guide:'Kojo says: “The trucks are here! Check what arrived and inspect the bridge before anyone tests it.”'},
  7:{icon:'🎉',title:'Test, Fix & Celebrate!',short:'Test your bridge and connect the towns',guide:'Ama says: “This is the big moment! If something goes wrong, investigate it, fix it and try again.”'},
};

export default function FootbridgeProjectEngineV2(){
  const c=useFootbridgeProject();
  const {state}=c;
  const s=state.scenario;
  const selectedSite=s.sites.find(site=>site.id===state.selectedSiteId);
  const mission=LEARNER_MISSIONS[state.currentMission];
  const missionContent=renderMission(c,state.currentMission);
  const completedMissions=([1,2,3,4,5,6,7] as MissionId[]).filter(id=>c.missionComplete(id)).length;

  return <section className="footbridge-project-engine kid-adventure">
    <div className="adventure-hero">
      <div className="hero-copy">
        <span className="adventure-kicker">🌉 MEZZO MATHS ADVENTURE</span>
        <h1>Can You Connect Adom & Nkabom?</h1>
        <p>Two communities are separated by a river. Use your maths, make smart choices and help them build a successful virtual footbridge.</p>
        <div className="hero-chips"><span>🔎 Explore</span><span>📏 Measure</span><span>🧮 Calculate</span><span>🛠️ Build</span><span>🎯 Test</span></div>
      </div>
      <div className="community-guides" aria-label="Your project guides">
        <div className="guide-character"><div className="guide-avatar">👧🏾</div><div><strong>Ama</strong><span>Adom school guide</span></div></div>
        <div className="guide-character"><div className="guide-avatar">👦🏾</div><div><strong>Kojo</strong><span>Nkabom community guide</span></div></div>
        <div className="scenario-mini"><span>Adventure code</span><strong>{s.scenarioId}</strong><small>Every new code creates a different challenge.</small><button type="button" onClick={c.startNewScenario}>🎲 New Adventure</button></div>
      </div>
    </div>

    <details className="simulation-safety-notice friendly-safety">
      <summary>🦺 Important safety note</summary>
      <p>{SAFETY_NOTICE}</p>
    </details>

    <div className="adventure-progress">
      <div className="progress-story"><span>YOUR BRIDGE ADVENTURE</span><strong>{c.completedCount} of 30 project actions completed</strong><small>{completedMissions} of 7 missions completed · your work saves automatically</small></div>
      <div className="bridge-progress-track" aria-label={`${c.progressPercent}% project complete`}><div style={{width:`${c.progressPercent}%`}}><span>🚶🏾</span></div></div>
      <strong className="progress-badge">{c.progressPercent}%</strong>
    </div>

    <div className="adventure-map-heading"><div><span>🗺️ YOUR ADVENTURE MAP</span><h2>Where are we going next?</h2></div><p>Finish a mission to unlock the next part of the journey.</p></div>
    <nav className="mission-roadmap kid-roadmap" aria-label="Footbridge adventure missions">
      {([1,2,3,4,5,6,7] as MissionId[]).map(id=>{
        const item=LEARNER_MISSIONS[id];
        const unlocked=id<=state.highestUnlockedMission;
        const complete=c.missionComplete(id);
        return <button key={id} type="button" disabled={!unlocked} className={`${state.currentMission===id?'active':''} ${complete?'complete':''}`} onClick={()=>unlocked&&c.setState(current=>({...current,currentMission:id}))}>
          <span className="mission-icon">{complete?'⭐':item.icon}</span>
          <span className="mission-copy"><small>MISSION {id}</small><strong>{item.title}</strong><em>{complete?'Completed!':unlocked?item.short:'Finish the earlier mission to unlock'}</em></span>
        </button>;
      })}
    </nav>

    <div className="guide-message"><div className="guide-message-avatar">{state.currentMission%2===1?'👧🏾':'👦🏾'}</div><div><span>YOUR MISSION NOW</span><strong>{mission.title}</strong><p>{mission.guide}</p></div></div>

    <div className="adventure-backpack">
      <span>🎒 <b>Adventure Backpack</b></span>
      <span>📍 {selectedSite?.name??'Choose a river crossing'}</span>
      <span>🌉 {state.selectedBridgeSystem?s.designCards[state.selectedBridgeSystem].name:'Choose a bridge idea'}</span>
      <span>⭐ {c.completedCount} actions complete</span>
      {state.redesignCount>0&&<span>🔁 {state.redesignCount} fix-it round{state.redesignCount===1?'':'s'}</span>}
    </div>

    {missionContent}

    <details className="project-notebook kid-notebook"><summary>📘 Open My Project Notebook</summary><div className="notebook-grid">{Object.entries(state.notebook).filter(([,entries])=>entries.length>0).map(([section,entries])=><article key={section}><h3>{friendlySection(section)}</h3>{entries.map((entry,index)=><p key={`${section}-${index}`}>{entry}</p>)}</article>)}{Object.values(state.notebook).every(entries=>entries.length===0)&&<p>Your discoveries, calculations and choices will appear here as you explore.</p>}</div></details>
  </section>;
}

function renderMission(c:ReturnType<typeof useFootbridgeProject>,mission:MissionId):ReactElement{
  if(mission===1)return <FootbridgeMission1 c={c}/>;
  if(mission===2)return <FootbridgeMission2 c={c}/>;
  if(mission===3)return <FootbridgeMission3 c={c}/>;
  if(mission===4)return <FootbridgeMission4 c={c}/>;
  if(mission===5)return <FootbridgeMission5 c={c}/>;
  if(mission===6)return <FootbridgeMission6 c={c}/>;
  return <FootbridgeMission7 c={c}/>;
}

function friendlySection(section:string){
  const names:Record<string,string>={
    COMMUNITY_SURVEY:'🏘️ What We Learned About the Communities',SITE_SURVEY:'🌊 River Exploration',MEASUREMENTS:'📏 My Measurements',ENVIRONMENTAL_INFORMATION:'🌧️ River & Weather Clues',SCALE_DRAWING:'🗺️ My Scale Plan',DESIGN_DECISIONS:'🌉 My Bridge Choice',CALCULATIONS:'🧮 My Maths Work',MATERIAL_ORDERS:'📦 Materials I Ordered',PROCUREMENT:'🛒 Shopping & Materials',TRANSPORT:'🚚 Delivery Plan',BUDGET:'💰 Money Plan',CONSTRUCTION_LOG:'🛠️ Build Story',INSPECTION:'🔎 My Bridge Check',TEST_RESULTS:'🎯 Test Results',DIAGNOSIS:'🕵🏾 Problem Solving',REDESIGN:'🔁 What I Fixed',FINAL_REPORT:'🏆 Final Project Story'
  };
  return names[section]??section.replace(/_/g,' ');
}
