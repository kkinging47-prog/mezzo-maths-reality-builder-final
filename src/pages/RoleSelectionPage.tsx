import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const roles = [
  { title: 'Student', icon: '🧑🏾‍🎓', text: 'Solve missions and build real-world objects.', link: '/student/dashboard' },
  { title: 'Teacher', icon: '👩🏾‍🏫', text: 'Assign projects and monitor learner progress.', link: '/teacher/dashboard' },
  { title: 'School Admin', icon: '🏫', text: 'Track classes, teachers and school performance.', link: '/school-admin/dashboard' },
  { title: 'Sponsor / Parent', icon: '🤝', text: 'Support learners and view impact dashboards.', link: '/sponsor/dashboard' },
  { title: 'Mezzo Admin', icon: '⚙️', text: 'Manage content, users and platform analytics.', link: '/admin/dashboard' },
];

export default function RoleSelectionPage() {
  return (
    <PageShell>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Choose role</span>
          <h1>Who is using Reality Builder today?</h1>
          <p>Each role opens a tailored dashboard for the same learning ecosystem.</p>
        </div>
        <div className="role-grid">
          {roles.map((role) => (
            <Link className="role-card card" to={role.link} key={role.title}>
              <span>{role.icon}</span>
              <h3>{role.title}</h3>
              <p>{role.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
