import { Project } from '../data/projects';
import Bridge2DConstructionSite from './Bridge2DConstructionSite';
import Playground2DConstructionSite from './Playground2DConstructionSite';
import Ferry2DConstructionSite from './Ferry2DConstructionSite';
import Irrigation2DConstructionSite from './Irrigation2DConstructionSite';
import SmartParking2DConstructionSite from './SmartParking2DConstructionSite';

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
  'simple-cleaning-robot': ['▦', '🤖', '🧽', '↪️', '🔋', '✅'],
  'tomato-sales-market': ['🧺', '🍅', '💵', '📒', '👥', '✅'],
  'smart-irrigation-system': ['🌱', '📏', '💧', '🚰', '🔵', '☀️'],
  'smart-car-parking-system': ['🅿️', '📏', '🚗', '🟢', '🚧', '✅'],
};

export default function VisualBuilder({ project, completed, mode, feedback }: VisualBuilderProps) {
  if (project.id === 'footbridge-stream' && mode === '2d') {
    return <Bridge2DConstructionSite buildStage={completed} feedback={feedback} />;
  }

  if (project.id === 'school-playground-layout' && mode === '2d') {
    return <Playground2DConstructionSite buildStage={completed} feedback={feedback} />;
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
