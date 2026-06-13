type StatCardProps = {
  label: string;
  value: string;
  note?: string;
};

export default function StatCard({ label, value, note }: StatCardProps) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}
