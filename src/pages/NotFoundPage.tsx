import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell>
      <section className="section empty-state card">
        <h1>Page not found</h1>
        <p>The page may have moved or the mission is not yet active.</p>
        <Link className="btn btn-primary" to="/">Go home</Link>
      </section>
    </PageShell>
  );
}
