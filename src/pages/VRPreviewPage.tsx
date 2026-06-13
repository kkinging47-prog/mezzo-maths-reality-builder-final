import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function VRPreviewPage() {
  return (
    <PageShell>
      <section className="section vr-section">
        <div>
          <span className="eyebrow">VR preview</span>
          <h1>A classroom-ready path toward immersive maths.</h1>
          <p>The MVP uses lightweight browser visuals now. Later, the same mission data can power WebXR, React Three Fiber and VR lab experiences.</p>
          <Link className="btn btn-primary" to="/demo">Try a mission</Link>
        </div>
        <div className="vr-card card">
          <div className="vr-headset">🥽</div>
          <h3>Future VR experience</h3>
          <p>Students will stand inside bridges, markets, cities and space labs while solving maths.</p>
        </div>
      </section>
    </PageShell>
  );
}
