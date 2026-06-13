import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';

export default function SchoolAdminDashboard() {
  return (
    <PageShell>
      <section className="section dashboard-hero"><div><span className="eyebrow">School admin</span><h1>School-wide maths implementation overview.</h1><p>Monitor participation, teacher usage and learner outcomes.</p></div></section>
      <section className="section stats-grid">
        <StatCard label="Students enrolled" value="620" note="Across departments" />
        <StatCard label="Teachers active" value="18" note="This term" />
        <StatCard label="Missions completed" value="2,340" note="School total" />
        <StatCard label="Improvement" value="+24%" note="From baseline" />
      </section>
    </PageShell>
  );
}
