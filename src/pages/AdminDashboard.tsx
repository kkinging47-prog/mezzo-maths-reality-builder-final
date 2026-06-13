import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';

export default function AdminDashboard() {
  return (
    <PageShell>
      <section className="section dashboard-hero"><div><span className="eyebrow">Mezzo admin</span><h1>Manage the Reality Builder platform.</h1><p>Oversee missions, schools, content, reports and deployment readiness.</p></div></section>
      <section className="section stats-grid">
        <StatCard label="Active projects" value="6" />
        <StatCard label="Coming soon" value="18+" />
        <StatCard label="System status" value="Healthy" />
        <StatCard label="Version" value="1.0" />
      </section>
    </PageShell>
  );
}
