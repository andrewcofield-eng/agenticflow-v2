import type { GeneratedContent } from "@/lib/types/campaign";

type ContentDraftCardProps = {
  content?: GeneratedContent;
  isLoading?: boolean;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
};

export default function ContentDraftCard({ content, isLoading = false, onRegenerate, canRegenerate = false }: ContentDraftCardProps) {
  return (
    <div className="result-card">
      <div className="section-header" style={{ marginBottom: 10 }}>
        <div>
          <h3>Generated content</h3>
          {content?.source ? (
            <div className="badge-row" style={{ marginTop: 10 }}>
              <span className={`badge ${content.source === "ai-generated" ? "badge-success" : "badge-warning"}`}>
                {content.source === "ai-generated" ? "AI-generated" : "Placeholder"}
              </span>
              {content.tokenEstimate ? <span className="badge badge-subtle">~{content.tokenEstimate} tokens</span> : null}
            </div>
          ) : null}
        </div>

        {onRegenerate ? (
          <button type="button" className="button-secondary" onClick={onRegenerate} disabled={!canRegenerate || isLoading}>
            {isLoading ? "Regenerating..." : "Regenerate"}
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="loading-inline">
          <span className="loading-spinner" />
          <p className="muted" style={{ margin: 0 }}>Generating channel-ready content with the configured content service...</p>
        </div>
      ) : null}

      {!content ? (
        <p className="muted">Draft content will appear after orchestration runs.</p>
      ) : (
        <ul className="list">
          <li><strong>Email subject:</strong> {content.emailSubject}</li>
          <li><strong>Email body:</strong> {content.emailBody}</li>
          <li><strong>Social post:</strong> {content.socialPost}</li>
          <li><strong>Paid ad headline:</strong> {content.adHeadline}</li>
          <li><strong>Paid ad copy:</strong> {content.adCopy}</li>
        </ul>
      )}
    </div>
  );
}
