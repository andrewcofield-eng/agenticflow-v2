import type { StrategyOutput } from "@/lib/types/campaign";

type StrategyCardProps = {
  strategy?: StrategyOutput;
};

export default function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <div className="result-card">
      <h3>Messaging strategy</h3>
      {!strategy ? (
        <p className="muted">Strategy will appear after orchestration runs.</p>
      ) : (
        <ul className="list">
          <li><strong>Campaign name:</strong> {strategy.campaignName}</li>
          <li><strong>Angle:</strong> {strategy.campaignAngle}</li>
          <li><strong>Value proposition:</strong> {strategy.valueProposition}</li>
          <li><strong>CTA:</strong> {strategy.ctaRecommendation}</li>
          <li><strong>Channels:</strong> {strategy.suggestedChannelMix.join(", ")}</li>
        </ul>
      )}
    </div>
  );
}
