import CampaignBuilderShell from "@/components/campaign-builder/campaignbuildershell";
import ResultsDashboardShell from "@/components/results/resultsdashboardshell";
import SourceDataPanelsShell from "@/components/source-panels/sourcedatapanelsshell";
import WorkflowVisualizationShell from "@/components/workflow/workflowvisualizationshell";

export default function BuilderPage() {
  return (
    <main className="page-shell page-shell-wide">
      <div className="page-stack">
        <section className="intro-card">
          <p className="eyebrow">Prototype Workspace</p>
          <h1>Campaign assembly demo</h1>
          <p className="muted">
            This Phase 2 scaffold shows the supervised workflow shape, source context panels, and
            results layout using mock data only.
          </p>
        </section>

        <CampaignBuilderShell />
        <SourceDataPanelsShell />
        <WorkflowVisualizationShell />
        <ResultsDashboardShell />
      </div>
    </main>
  );
}
