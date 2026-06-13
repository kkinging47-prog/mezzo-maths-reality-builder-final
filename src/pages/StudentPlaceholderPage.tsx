import PageShell from '../components/PageShell';

type StudentPlaceholderPageProps = {
  title: string;
  description: string;
};

export default function StudentPlaceholderPage({ title, description }: StudentPlaceholderPageProps) {
  return (
    <PageShell>
      <section className="section empty-state card">
        <span className="eyebrow">Student area</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </PageShell>
  );
}
