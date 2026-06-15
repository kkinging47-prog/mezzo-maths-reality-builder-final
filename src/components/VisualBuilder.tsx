import { Project } from '../data/projects';
import Bridge2DConstructionSite from './Bridge2DConstructionSite';
import Bridge3DConstructionSite from './Bridge3DConstructionSiteV3';
import BridgeVRConstructionSite from './BridgeVRConstructionSite';
import Playground2DConstructionSite from './Playground2DConstructionSite';
import Playground3DConstructionSite from './Playground3DConstructionSiteV2';
import Ferry2DConstructionSite from './Ferry2DConstructionSite';
import Ferry3DConstructionSite from './Ferry3DConstructionSite';
import Irrigation2DConstructionSite from './Irrigation2DConstructionSite';
import Irrigation3DConstructionSite from './Irrigation3DConstructionSite';
import SmartParking2DConstructionSite from './SmartParking2DConstructionSite';
import SmartParking3DConstructionSite from './SmartParking3DConstructionSiteV2';
import FloodDrainage2DConstructionSite from './FloodDrainage2DConstructionSite';

type VisualBuilderProps = {
  project: Project;
  completed: number;
  mode: '2d' | '3d' | 'vr';
  feedback?: string;
};

const scenes: Record<string, string[]> = {
  'footbridge-stream': ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
  'school-playground-layout': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
  'ferry-river-crossing': ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'],
  'flood-safe-road-drainage-upgrade': ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'],
  'tomato-sales-market': ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  'smart-irrigation-system': ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'],
  'smart-car-parking-system': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
};

export default function VisualBuilder({ project, completed, mode, feedback }: VisualBuilderProps) {
  if (project.id === 'footbridge-stream' && mode === 'vr') return <BridgeVRConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'footbridge-stream' && mode === '3d') return <Bridge3DConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'footbridge-stream' && mode === '2d') return <Bridge2DConstructionSite buildStage={completed} feedback={feedback} />;

  if (project.id === 'school-playground-layout' && mode === '3d') return <Playground3DConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'school-playground-layout' && mode === '2d') return <Playground2DConstructionSite buildStage={completed} feedback={feedback} />;

  if (project.id === 'ferry-river-crossing' && mode === '3d') return <Ferry3DConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'ferry-river-crossing' && mode === '2d') return <Ferry2DConstructionSite buildStage={completed} feedback={feedback} />;

  if (project.id === 'smart-irrigation-system' && mode === '3d') return <Irrigation3DConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'smart-irrigation-system' && mode === '2d') return <Irrigation2DConstructionSite buildStage={completed} feedback={feedback} />;

  if (project.id === 'smart-car-parking-system' && mode === '3d') return <SmartParking3DConstructionSite buildStage={completed} feedback={feedback} />;
  if (project.id === 'smart-car-parking-system' && mode === '2d') return <SmartParking2DConstructionSite buildStage={completed} feedback={feedback} />;

  if (project.id === 'flood-safe-road-drainage-upgrade' && mode === '2d') return <FloodDrainage2DConstructionSite buildStage={completed} feedback={feedback} />;

  const parts = scenes[project.id] ?? ['1', '2', '3', '4'];
  return (
    <section className={`visual-builder ${mode}`}>
      <div className="visual-topbar">
        <span>{mode.toUpperCase()} build view</span>
        <strong>{completed}/{project.steps.length} steps built</strong>
      </div>
      <div className="visual-stage" aria-label={`${project.title} visual progress`}>
        {parts.map((part, index) => (
          <div key={`${part}-${index}`} className={`build-piece ${index < completed ? 'built' : ''}`}>
            <span>{index < completed ? part : '•'}</span>
          </div>
        ))}
      </div>
      <p className="visual-caption">
        {mode === '2d' && 'A simple plan view that updates as students solve each question.'}
        {mode === '3d' && 'A 3D-style builder preview showing depth, layers and construction progress.'}
        {mode === 'vr' && 'VR preview mode prepares the project for future classroom experiences.'}
      </p>
    </section>
  );
}
