import { campaignGoals, campaignSegments, channelThemes, productFocuses } from "@/lib/data/mock-data/campaign-presets";

export default function CampaignFormShell() {
  return (
    <div className="builder-grid">
      <div className="section-card" style={{ padding: 20 }}>
        <div className="field-stack">
          <div className="field">
            <label htmlFor="goal">Campaign goal</label>
            <select id="goal" defaultValue={campaignGoals[0]}>
              {campaignGoals.map((goal) => (
                <option key={goal}>{goal}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="segment">Customer segment</label>
            <select id="segment" defaultValue={campaignSegments[0]}>
              {campaignSegments.map((segment) => (
                <option key={segment}>{segment}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="product">Product or category focus</label>
            <select id="product" defaultValue={productFocuses[0]}>
              {productFocuses.map((product) => (
                <option key={product}>{product}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="theme">Theme or channel emphasis</label>
            <select id="theme" defaultValue={channelThemes[0]}>
              {channelThemes.map((theme) => (
                <option key={theme}>{theme}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="cta-row">
          <button className="button" type="button">
            Generate campaign shell
          </button>
        </div>
      </div>

      <div className="section-card" style={{ padding: 20 }}>
        <p className="eyebrow">Current scope</p>
        <h3>What this form is doing right now</h3>
        <ul className="list">
          <li>Shows the shape of the campaign setup experience</li>
          <li>Uses controlled sample values from mock data</li>
          <li>Prepares the interface for later workflow logic</li>
          <li>Does not yet run recommendation or generation logic</li>
        </ul>
      </div>
    </div>
  );
}
