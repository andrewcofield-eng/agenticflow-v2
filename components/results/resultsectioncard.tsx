type ResultSectionCardProps = {
  title: string;
  items: string[];
};

export default function ResultSectionCard({ title, items }: ResultSectionCardProps) {
  return (
    <div className="result-card">
      <h3>{title}</h3>
      <ul className="list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
