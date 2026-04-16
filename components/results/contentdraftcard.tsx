import type { GeneratedContent } from "@/lib/types/campaign";

type ContentDraftCardProps = {
  content?: GeneratedContent;
};

export default function ContentDraftCard({ content }: ContentDraftCardProps) {
  return (
    <div className="result-card">
      <h3>Generated content</h3>
      {!content ? (
        <p className="muted">Draft content will appear after orchestration runs.</p>
      ) : (
        <ul className="list">
          <li><strong>Email subject:</strong> {content.emailSubject}</li>
          <li><strong>Email body:</strong> {content.emailBody}</li>
          <li><strong>Social post:</strong> {content.socialPost}</li>
          <li><strong>Paid ad headline:</strong> {content.paidAdHeadline}</li>
          <li><strong>Paid ad copy:</strong> {content.paidAdCopy}</li>
        </ul>
      )}
    </div>
  );
}
