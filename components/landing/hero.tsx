import LaunchDemoButton from "./launchdemobutton";
import Badge from "@/components/ui/badge";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-card">
          <p className="eyebrow">AgenticFlow v2</p>
          <h1>Supervised multi-agent campaign assembly, framed as a strategic prototype.</h1>
          <p className="muted">
            A portfolio-grade concept demo showing how audience intelligence, product context, and
            brand assets can be unified to assemble more relevant marketing campaigns.
          </p>
          <div className="cta-row">
            <LaunchDemoButton />
            <a className="button-secondary" href="#project-summary">
              Learn how it works
            </a>
          </div>
        </div>

        <div className="hero-card">
          <p className="eyebrow">What this prototype demonstrates</p>
          <div className="list-stack">
            <Badge text="Connected CRM, PIM, and DAM context" strong />
            <Badge text="Visible supervised workflow" strong />
            <Badge text="Mock-first, integration-ready architecture" strong />
            <Badge text="Explainable campaign recommendations" strong />
          </div>
          <div className="summary-box" style={{ marginTop: 20 }}>
            <strong>Current phase:</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              UI shells and controlled sample data only. No live connections, no publishing, and no
              production infrastructure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
