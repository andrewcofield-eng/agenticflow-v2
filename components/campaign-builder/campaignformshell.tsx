import { campaignGoals, campaignSegments, channelThemes, productFocuses } from "@/lib/data/mock-data/campaign-presets";
import type { CampaignInput } from "@/lib/types/campaign";

type CampaignFormShellProps = {
  value: CampaignInput;
  onChange: (next: CampaignInput) => void;
  onGenerate: () => void;
  isRunning: boolean;
};

export default function CampaignFormShell({ value, onChange, onGenerate, isRunning }: CampaignFormShellProps) {
  return (
    <div className="builder-grid">
      <div className="section-card" style={{ padding: 20 }}>
        <div className="field-stack">
          <div className="field">
            <label htmlFor="goal">Campaign goal</label>
            <select
              id="goal"
              value={value.campaignGoal}
              onChange={(event) => onChange({ ...value, campaignGoal: event.target.value })}
            >
              {campaignGoals.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="segment">Customer segment</label>
            <select
              id="segment"
              value={value.selectedSegmentName}
              onChange={(event) => onChange({ ...value, selectedSegmentName: event.target.value })}
            >
              {campaignSegments.map((segment) => (
                <option key={segment}>{segment}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="product">Product or category focus</label>
            <select
              id="product"
              value={value.selectedProductOrCategory}
              onChange={(event) => onChange({ ...value, selectedProductOrCategory: event.target.value })}
            >
              {productFocuses.map((product) => (
                <option key={product}>{product}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="theme">Theme or channel emphasis</label>
            <select
              id="theme"
              value={value.selectedTheme}
              onChange={(event) =>
                onChange({
                  ...value,
                  selectedTheme: event.target.value,
                  selectedChannelEmphasis: event.target.value,
                })
              }
            >
              {channelThemes.map((theme) => (
                <option key={theme}>{theme}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cta-row">
          <button className="button" type="button" onClick={onGenerate} disabled={isRunning}>
            {isRunning ? "Generating campaign..." : "Generate Campaign"}
          </button>
        </div>
      </div>

      <div className="section-card" style={{ padding: 20 }}>
        <p className="eyebrow">Current scope</p>
        <h3>What this form does in Phase 3</h3>
        <ul className="list">
          <li>Captures the campaign intent for the orchestrator</li>
          <li>Runs a full mock-only end-to-end orchestration flow</li>
          <li>Uses deterministic selection for audience, product, and asset choices</li>
          <li>Uses placeholder strategy and content generation to keep the prototype stable</li>
        </ul>
      </div>
    </div>
  );
}
