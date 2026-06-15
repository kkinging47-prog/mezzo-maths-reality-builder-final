import { Project } from '../data/projects';
import Bridge2DConstructionSite from './Bridge2DConstructionSite';
import Bridge3DConstructionSite from './Bridge3DConstructionSiteV3';
import Playground2DConstructionSite from './Playground2DConstructionSite';
import Playground3DConstructionSite from './Playground3DConstructionSiteV2';
import Ferry2DConstructionSite from './Ferry2DConstructionSite';
import Ferry3DConstructionSite from './Ferry3DConstructionSite';
import Irrigation2DConstructionSite from './Irrigation2DConstructionSite';
import SmartParking2DConstructionSite from './SmartParking2DConstructionSite';
import FloodDrainage2DConstructionSite from './FloodDrainage2DConstructionSite';

type VisualBuilderProps = {
  project: Project;
  completed: number;
  mode: '2d' | '3d' | 'vr';
  feedback?: string;
};

const scenes: Record<string, string[]> = {
  'footbridge-stream': ['🌊', '🪵', '🪵', '🚶', '🧱', '✅'],
  'school-playground-layout': ['⬛', '📏', '⚽', '🪑', '🌳', '✅'],
  'ferry-river-crossing': ['🌊', '⛴️', '⏱️', '⛽', '🎟️', '🦺'],
  'flood-safe-road-drainage-upgrade': ['🌧️', '📏', '🚧', '🛣️', '🧱', '✅'],
  'tomato-sales-market': ['🧺', '🍅', '💵', '📒', '👥', '✅'],
  'smart-irrigation-system': ['🌱', '📏', '💧', '🚰', '🔵', '☀️'],
  'smart-car-parking-system': ['🅿️', '📏', '🚗', '🟢', '🚧', '✅'],
};

export default function VisualBuilder({ project, completed, mode, feedback }: VisualBuilderProps) {
  if (project.id === 'footbridge-stream' && mode === '3d') {
    return <Bridge3DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'footbridge-stream' && mode === '2d') {
    return <Bridge2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'school-playground-layout' && mode === '3d') {
    return <Playground3DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'school-playground-layout' && mode === '2d') {
    return <Playground2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'ferry-river-crossing' && mode === '3d') {
    return <Ferry3DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'ferry-river-crossing' && mode === '2d') {
    return <Ferry2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'smart-irrigation-system' && mode === '2d') {
    return <Irrigation2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'smart-car-parking-system' && mode === '2d') {
    return <SmartParking2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'flood-safe-road-drainage-upgrade' && mode === '2d') {
    return <FloodDrainage2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  const parts = scenes[project.id] ?? ['📐', '🧮', '🏗️', '✅'];
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
        {mode === 'vr' && 'VR preview mode prepares the project for future WebXR classroom experiences.'}
      </p>
    </section>
  );
}
