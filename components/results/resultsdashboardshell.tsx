import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import type { CampaignContext } from "@/lib/types/orchestrator";
import ContentDraftCard from "./contentdraftcard";
import ReviewStatusCard from "./reviewstatuscard";
import StrategyCard from "./strategycard";

type ResultsDashboardShellProps = {
  context: CampaignContext | null;
};

export default function ResultsDashboardShell({ context }: ResultsDashboardShellProps) {
  return (
    <SectionCard>
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
          <div className="summary-box">
            <p className="eyebrow">At a glance</p>
            <div className="badge-row">
              <span className="badge">Input focus: {context.input.selectedProductOrCategory}</span>
              <span className="badge">Products: {context.selections.selectedProducts.length}</span>
              <span className="badge">Assets: {context.selections.selectedAssets.length}</span>
              <span className="badge">Status: Draft ready for human review</span>
            </div>
          </div>

          <div className="results-grid">
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
