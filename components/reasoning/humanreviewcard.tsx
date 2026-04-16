type HumanReviewCardProps = {
  checklist: string[];
};

export default function HumanReviewCard({ checklist }: HumanReviewCardProps) {
  return (
    <div className="mini-card">
      <p className="eyebrow">Human review required</p>
      <ul className="list">
        {checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
