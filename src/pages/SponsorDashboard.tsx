import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';

export default function SponsorDashboard() {
  return (
    <PageShell>
      <section className="section dashboard-hero"><div><span className="eyebrow">Sponsor / parent dashboard</span><h1>See the learning impact you are supporting.</h1><p>Track sponsored schools, learner activity and STEM readiness stories.</p></div></section>
      <section className="section stats-grid">
        <StatCard label="Schools supported" value="12" />
        <StatCard label="Learners reached" value="4,800" />
        <StatCard label="Certificates earned" value="1,190" />
        <StatCard label="Regions" value="4" />
      </section>
    </PageShell>
  );
}
