import type { ReviewSummary } from "@/lib/types/campaign";

type ReviewStatusCardProps = {
  reviewSummary?: ReviewSummary;
};

export default function ReviewStatusCard({ reviewSummary }: ReviewStatusCardProps) {
  return (
    <div className="result-card">
      <h3>Review status</h3>
      {!reviewSummary ? (
        <p className="muted">The review state will appear after the orchestrator completes.</p>
      ) : (
        <>
          <p><strong>Draft ready for human review</strong></p>
          <ul className="list">
            <li>{reviewSummary.completenessSummary}</li>
            <li>{reviewSummary.consistencySummary}</li>
          </ul>
        </>
      )}
    </div>
  );
}
