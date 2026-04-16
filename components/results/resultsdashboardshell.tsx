import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import type { CampaignContext } from "@/lib/types/orchestrator";
import ContentDraftCard from "./contentdraftcard";
import ReviewStatusCard from "./reviewstatuscard";
import StrategyCard from "./strategycard";

type ResultsDashboardShellProps = {
  context: CampaignContext | null;
};

function CampaignSummaryCard({ context }: { context: CampaignContext }) {
  const topProducts = context.selections.selectedProducts.slice(0, 3);
  const topAssets = context.selections.selectedAssets.slice(0, 3);

  return (
    <div className="campaign-summary-card">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="eyebrow">Level 1 · Campaign summary</p>
          <h3>{context.outputs.strategy?.campaignName ?? "Campaign draft pending"}</h3>
        </div>
        <span className="badge badge-success">Draft ready for human review</span>
      </div>

      <div className="campaign-summary-grid">
        <div className="campaign-summary-block">
          <p className="campaign-summary-label">Target audience</p>
          <p className="campaign-summary-value">{context.selections.selectedAudience?.name ?? "Not selected"}</p>
        </div>

        <div className="campaign-summary-block">
          <p className="campaign-summary-label">Key messaging angle</p>
          <p className="campaign-summary-value">{context.outputs.strategy?.campaignAngle ?? "Strategy will appear after orchestration runs."}</p>
        </div>

        <div className="campaign-summary-block">
          <p className="campaign-summary-label">Top recommended products</p>
          <div className="summary-list-stack">
            {topProducts.map((product) => (
              <div key={product.id} className="summary-chip-card">
                <span>{product.name}</span>
                <span className="badge">{product.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="campaign-summary-block">
          <p className="campaign-summary-label">Top recommended assets</p>
          <div className="summary-list-stack">
            {topAssets.map((asset) => (
              <div key={asset.id} className="summary-chip-card">
                <span>{asset.title}</span>
                <span className="badge">{asset.assetType}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-row" style={{ marginTop: 20 }}>
        <a className="button" href="#results-details">View Full Details</a>
        <a className="button-secondary" href="#reasoning-panel">View Reasoning</a>
      </div>
    </div>
  );
}

export default function ResultsDashboardShell({ context }: ResultsDashboardShellProps) {
  return (
    <SectionCard id="results-dashboard">
      <PageHeader
        eyebrow="Results dashboard"
        title="Campaign package assembled by the orchestrator"
        description="This dashboard shows the selected audience, products, assets, strategy, draft content, and final review state."
      />

      {!context ? (
        <div className="mini-card">
          <p className="muted">Generate a campaign to populate the dashboard.</p>
        </div>
      ) : (
        <div className="page-stack">
          <CampaignSummaryCard context={context} />

          <div className="results-grid" id="results-details">
            <div className="result-card">
              <h3>Campaign summary</h3>
              <ul className="list">
                <li><strong>Campaign name:</strong> {context.outputs.strategy?.campaignName ?? "Not generated"}</li>
                <li><strong>Objective:</strong> {context.input.campaignGoal}</li>
                <li><strong>Selected product/category input:</strong> {context.input.selectedProductOrCategory}</li>
                <li><strong>Target audience:</strong> {context.selections.selectedAudience?.name ?? "Not selected"}</li>
                <li><strong>Status:</strong> Draft ready for human review</li>
              </ul>
            </div>

            <div className="result-card">
              <h3>Recommended products ({context.selections.selectedProducts.length})</h3>
              <ul className="list">
                {context.selections.selectedProducts.map((product) => (
                  <li key={product.id}>{product.name} ({product.category})</li>
                ))}
              </ul>
            </div>

            <div className="result-card">
              <h3>Recommended assets ({context.selections.selectedAssets.length})</h3>
              <ul className="list">
                {context.selections.selectedAssets.map((asset) => (
                  <li key={asset.id}>{asset.title} ({asset.assetType})</li>
                ))}
              </ul>
            </div>

            <StrategyCard strategy={context.outputs.strategy} />
            <ContentDraftCard content={context.outputs.generatedContent} />
            <ReviewStatusCard reviewSummary={context.outputs.reviewSummary} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
