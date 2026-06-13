import { Project } from '../data/projects';

type VisualBuilderProps = {
  project: Project;
  completed: number;
  mode: '2d' | '3d' | 'vr';
};

const scenes: Record<string, string[]> = {
  'footbridge-stream': ['🌊', '🪵', '🪵', '🚶', '🧱', '✅'],
  'school-playground-layout': ['⬛', '📏', '⚽', '🪑', '🌳', '✅'],
  'ferry-river-crossing': ['🌊', '⛴️', '⏱️', '⛽', '🎟️', '🦺'],
  'simple-cleaning-robot': ['▦', '🤖', '🧽', '↪️', '🔋', '✅'],
  'tomato-sales-market': ['🧺', '🍅', '💵', '📒', '👥', '✅'],
  'weather-balloon-launch': ['🎈', '📦', '📡', '📈', '🛰️', '🚀'],
};

export default function VisualBuilder({ project, completed, mode }: VisualBuilderProps) {
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
