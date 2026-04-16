"use client";

import { useEffect, useMemo, useState } from "react";
import CampaignBuilderShell from "@/components/campaign-builder/campaignbuildershell";
import CampaignFormShell from "@/components/campaign-builder/campaignformshell";
import ReasoningPanel from "@/components/reasoning/reasoningpanel";
import ResultsDashboardShell from "@/components/results/resultsdashboardshell";
import SourceDataPanelsShell from "@/components/source-panels/sourcedatapanelsshell";
import WorkflowVisualizationShell from "@/components/workflow/workflowvisualizationshell";
import { campaignGoals, campaignSegments, channelThemes, productFocuses } from "@/lib/data/mock-data/campaign-presets";
import type { CampaignInput } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";
import { runAgenticFlowOrchestrator } from "@/lib/workflow/orchestrator";

const initialInput: CampaignInput = {
  campaignGoal: campaignGoals[0],
  selectedSegmentName: campaignSegments[0],
  selectedProductOrCategory: productFocuses[0],
  selectedTheme: channelThemes[0],
  selectedChannelEmphasis: channelThemes[0],
};

export default function BuilderPage() {
  const [formValue, setFormValue] = useState<CampaignInput>(initialInput);
  const [context, setContext] = useState<CampaignContext | null>(null);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const visibleSteps = useMemo<WorkflowStepResult[]>(() => {
    if (!context) return [];
    return context.trace.workflowSteps.slice(0, revealedSteps);
  }, [context, revealedSteps]);

  useEffect(() => {
    if (!context || !isRunning) return;

    if (revealedSteps >= context.trace.workflowSteps.length) {
      setIsRunning(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealedSteps((current) => current + 1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [context, isRunning, revealedSteps]);

  function handleGenerate() {
    const nextContext = runAgenticFlowOrchestrator(formValue);
    setContext(nextContext);
    setRevealedSteps(0);
    setIsRunning(true);
  }

  return (
    <main className="page-shell page-shell-wide">
      <div className="page-stack">
        <section className="intro-card">
          <p className="eyebrow">Prototype Workspace</p>
          <h1>AgenticFlow Orchestrator demo</h1>
          <p className="muted">
            This mock-only Phase 3 slice wires up a central orchestrator, deterministic selection logic, visible workflow progression, and a structured reasoning panel.
          </p>
        </section>

        <CampaignBuilderShell />
        <CampaignFormShell value={formValue} onChange={setFormValue} onGenerate={handleGenerate} isRunning={isRunning} />
        <SourceDataPanelsShell />
        <WorkflowVisualizationShell
          steps={visibleSteps}
          isRunning={isRunning}
          currentStepIndex={Math.max(0, visibleSteps.length - 1)}
        />
        <ResultsDashboardShell context={context && !isRunning ? context : null} />
        <ReasoningPanel context={context && !isRunning ? context : null} />
      </div>
    </main>
  );
}
