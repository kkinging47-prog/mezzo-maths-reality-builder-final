import PageShell from '../components/PageShell';
import MissionEngine from '../components/MissionEngine';
import { projects } from '../data/projects';

export default function DemoPage() {
  return (
    <PageShell>
      <section className="section project-hero">
        <div>
          <span className="eyebrow">Demo mode</span>
          <h1>Try the bridge mission immediately</h1>
          <p>This demo opens the first practical mission without login, so schools and parents can see the idea quickly.</p>
        </div>
      </section>
      <section className="section no-top">
        <MissionEngine project={projects[0]} />
      </section>
    </PageShell>
  );
}
