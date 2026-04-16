import type { CampaignContext } from "@/lib/types/orchestrator";

type DecisionSummaryCardProps = {
  context: CampaignContext;
};

export default function DecisionSummaryCard({ context }: DecisionSummaryCardProps) {
  return (
    <div className="mini-card">
      <p className="eyebrow">Decision summary</p>
      <ul className="list">
        <li>
          <strong>Selected product/category input:</strong> {context.input.selectedProductOrCategory}
        </li>
        <li>
          <strong>Audience:</strong> {context.selections.selectedAudience?.name ?? "Not selected"}
        </li>
        <li>
          <strong>Recommended products ({context.selections.selectedProducts.length}):</strong> {context.selections.selectedProducts.map((product) => product.name).join(", ") || "None"}
        </li>
        <li>
          <strong>Recommended assets ({context.selections.selectedAssets.length}):</strong> {context.selections.selectedAssets.map((asset) => asset.title).join(", ") || "None"}
        </li>
        <li>
          <strong>Strategy:</strong> {context.outputs.strategy?.campaignAngle ?? "Not generated"}
        </li>
      </ul>
    </div>
  );
}
