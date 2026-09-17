import { canonicalProcurementRequirements } from '../../footbridge/mathEngine';
import { deriveConstructionAssessment, deriveDelivery, deliveryCondition, inspectionShouldApprove, redesignMissionForCause } from '../../footbridge/failureEngine';
import { FootbridgeController } from '../../footbridge/useFootbridgeProject';

export default function FootbridgeMission6({c}:{c:FootbridgeController}){
  const state=c.state;
  const task=(id:number)=>c.recordFor(id).completed?'project-action complete':'project-action';
  const req=canonicalProcurementRequirements(state);
  if(!req)return <div className="project-mission-content"><div className="locked-note">The project needs a selected design system before construction can begin.</div></div>;
  const hasDelivery=Object.keys(state.materialsDelivered).length>0;
  const assessment=deriveConstructionAssessment(state);
  const condition=hasDelivery?deliveryCondition(state):'pending';
  const shouldApprove=hasDelivery?inspectionShouldApprove(state):false;
  const cues=inspectionCues(state,assessment.defects,assessment.overages);

  function receiveDelivery(){
    const delivery=deriveDelivery(state);
    const nextState={...state,materialsDelivered:delivery.delivered};
    const nextAssessment=deriveConstructionAssessment(nextState);
    c.setState(current=>({...current,materialsDelivered:delivery.delivered,constructionDefects:nextAssessment.defects,constructionComplete:nextAssessment.constructionComplete,inspectionFindings:[],testingAuthorised:false,normalTestStatus:undefined,peakTestStatus:undefined,environmentTestStatus:undefined,lastFailureCause:undefined}));
    c.setDecisionFeedback(25,`Delivery received: ${Object.values(delivery.delivered).reduce((a,b)=>a+b,0)} of ${delivery.totalOrdered} ordered simulation units reached the site.`);
  }

  function inspectDelivery(answer:string){
    const ok=answer===condition;
    c.recordAttempt(25,answer,ok,{completeOnAttempt:true,misconceptionTag:ok?undefined:'PROCUREMENT_ERROR',notebookSection:'CONSTRUCTION_LOG',notebookEntry:`Delivery inspection classification: ${answer}. Delivered inventory: primary ${state.materialsDelivered.primary??0}, deck ${state.materialsDelivered.deck??0}, connections ${state.materialsDelivered.connections??0}, secondary ${state.materialsDelivered.secondary??0}.`});
    c.setDecisionFeedback(25,ok?'You interpreted the delivery and site inventory correctly.':'Inspection response recorded. Compare the order, required quantities and what is physically present at the site.');
  }

  function inspectionDecision(answer:'approve'|'return'){
    const ok=(answer==='approve')===shouldApprove;
    c.setState(current=>({...current,testingAuthorised:answer==='approve',inspectionFindings:cues}));
    c.recordAttempt(26,answer,ok,{completeOnAttempt:true,misconceptionTag:ok?undefined:'LOGICAL_REASONING_ERROR',notebookSection:'INSPECTION',notebookEntry:`Pre-test inspection decision: ${answer==='approve'?'APPROVE FOR TESTING':'RETURN FOR CORRECTION'}. Observations: ${cues.join(' | ')||'No visible concerns recorded.'}`});
    c.setDecisionFeedback(26,ok?(answer==='approve'?'Inspection decision accepted. The project may proceed to staged testing.':'Good inspection. You identified that the project should return for correction before testing.'):(answer==='approve'?'Approval recorded. Any unresolved project-state problem will become visible during testing; the simulation will not silently repair it.':'Return decision recorded. Review the evidence and decide which project stage needs revision.'));
  }

  function openCorrection(){
    const target=redesignMissionForCause(assessment.primaryFailureCause);
    c.setState(current=>({...current,currentMission:target}));
    window.scrollTo({top:0,behavior:'smooth'});
  }

  return <div className="project-mission-content">
    <div className="mission-narrative"><span>Mission 6 · Construction site</span><h2>Receive the materials, construct what your mathematics allows, then inspect it.</h2><p>The site does not receive a perfect bridge automatically. Package orders and transport trips determine what physically arrives. Excess materials stay visible; shortages stay missing.</p></div>

    <div className="construction-yard"><div className="yard-river"><span>ADOM</span><i/><span>NKABOM</span></div><div className={`bridge-state ${state.constructionComplete?'complete':'incomplete'}`}><strong>{hasDelivery?(state.constructionComplete?'Virtual construction assembled':'Virtual construction incomplete'):'Waiting for delivery'}</strong><span>{hasDelivery?`${Object.values(state.materialsDelivered).reduce((a,b)=>a+b,0)} simulation material units at site`:'Receive the scheduled delivery to begin.'}</span></div></div>

    <article className={task(25)}><div><span>Receive and inspect materials</span><h3>Compare the order, delivery capacity and the material inventory that reaches the site.</h3></div>{!hasDelivery&&<button className="btn btn-primary" type="button" onClick={receiveDelivery}>Receive scheduled delivery</button>}{hasDelivery&&<><div className="inventory-table"><div><b>Material</b><b>Minimum required</b><b>Ordered</b><b>Delivered</b></div>{[['Primary','primary',req.primaryUnits],['Deck','deck',req.deckUnits],['Connections','connections',req.connections],['Secondary','secondary',req.secondaryBaseUnits]].map(([label,key,needed])=><div key={String(key)}><span>{label}</span><span>{Number(needed).toFixed(String(key)==='secondary'?1:0)}</span><span>{(state.materialsOrdered[String(key)]??0).toFixed(0)}</span><span>{(state.materialsDelivered[String(key)]??0).toFixed(String(key)==='secondary'?1:0)}</span></div>)}</div><div className="choice-grid"><button type="button" onClick={()=>inspectDelivery('complete')}>Everything required appears complete</button><button type="button" onClick={()=>inspectDelivery('shortage')}>There is a shortage</button><button type="button" onClick={()=>inspectDelivery('excess')}>There is excess material</button><button type="button" onClick={()=>inspectDelivery('mixed')}>There is both shortage and excess</button></div></>}{c.feedback[25]&&<p className="action-feedback">{c.feedback[25]}</p>}</article>

    <article className={task(26)}><div><span>Pre-test site inspection</span><h3>Walk around the virtual project and decide whether it is ready for testing.</h3></div>{!hasDelivery?<p className="locked-note">Receive and inspect the delivery first.</p>:<><div className="inspection-cues">{cues.length?cues.map((cue,index)=><div key={index}><span>🔎</span><p>{cue}</p></div>):<div><span>✓</span><p>No visible construction concern is detected during this inspection pass.</p></div>}</div><div className="inspection-actions"><button className="approve" type="button" onClick={()=>inspectionDecision('approve')}>APPROVE FOR TESTING</button><button className="return" type="button" onClick={()=>inspectionDecision('return')}>RETURN FOR CORRECTION</button></div></>}{c.feedback[26]&&<p className="action-feedback">{c.feedback[26]}</p>}{c.recordFor(26).completed&&!state.testingAuthorised&&hasDelivery&&<button className="btn btn-ghost" type="button" onClick={openCorrection}>Open the project stage most relevant to this problem</button>}</article>

    {c.missionComplete(6)&&state.testingAuthorised&&<button className="mission-advance" type="button" onClick={c.unlockNextMission}>Construction has been inspected. Authorise staged testing →</button>}
  </div>;
}

function inspectionCues(state:FootbridgeController['state'],defects:string[],overages:Record<string,number>){
  const cues:string[]=[];
  if(defects.includes('DECK_SHORTAGE'))cues.push('A visible gap remains in the virtual walking surface.');
  if(defects.includes('PRIMARY_SHORTAGE'))cues.push('At least one planned primary component location is empty.');
  if(defects.includes('CONNECTION_SHORTAGE'))cues.push('Some connection markers are visibly incomplete.');
  if(defects.includes('DELIVERY_SHORTAGE'))cues.push('The delivery log shows ordered materials still remaining at the supplier.');
  if(defects.includes('SPAN_MEASUREMENT_SHORTFALL'))cues.push('The constructed virtual span does not align cleanly with both surveyed bank markers.');
  if(defects.includes('WALKWAY_TOO_NARROW'))cues.push('The walkway gauge does not reach the width marker specified in the project brief.');
  const excessTotal=Object.values(overages).reduce((a,b)=>a+b,0);
  if(excessTotal>0)cues.push(`${Math.round(excessTotal)} unused simulation material units remain beside the project after assembly.`);
  if(!state.floodIdentified)cues.push('The site notebook contains flood evidence that was not carried into the final planning record.');
  return cues;
}
