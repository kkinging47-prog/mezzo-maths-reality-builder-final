import PageShell from '../components/PageShell';
import StatCard from '../components/StatCard';

export default function TeacherDashboard() {
  return (
    <PageShell>
      <section className="section dashboard-hero">
        <div>
          <span className="eyebrow">Teacher dashboard</span>
          <h1>Assign missions and track practical maths progress.</h1>
          <p>See which learners are struggling with measurement, money, geometry and reasoning.</p>
        </div>
      </section>
      <section className="section stats-grid">
        <StatCard label="Classes" value="4" note="Primary and JHS groups" />
        <StatCard label="Active learners" value="128" note="This week" />
        <StatCard label="Average score" value="82%" note="Across missions" />
        <StatCard label="Needs support" value="17" note="Learners flagged" />
      </section>
      <section className="section dashboard-grid">
        <article className="card"><h3>Assignments</h3><p>Bridge Builder · Due Friday · 68% submitted</p><p>Farm & Market Maths · Due Monday · 42% submitted</p></article>
        <article className="card"><h3>Class insight</h3><p>Most learners understand multiplication, but word problem interpretation needs attention.</p></article>
      </section>
    </PageShell>
  );
}
