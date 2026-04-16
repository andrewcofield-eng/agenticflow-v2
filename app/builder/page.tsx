"use client";

import { useEffect, useMemo, useState } from "react";
import CampaignBuilderShell from "@/components/campaign-builder/campaignbuildershell";
import CampaignFormShell from "@/components/campaign-builder/campaignformshell";
import ReasoningPanel from "@/components/reasoning/reasoningpanel";
import ResultsDashboardShell from "@/components/results/resultsdashboardshell";
import SourceDataPanelsShell from "@/components/source-panels/sourcedatapanelsshell";
import WorkflowVisualizationShell from "@/components/workflow/workflowvisualizationshell";
import { campaignGoals, campaignSegments, channelThemes, productFocuses } from "@/lib/data/mock-data/campaign-presets";
import type { CampaignInput, GeneratedContent } from "@/lib/types/campaign";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";
import { buildPlaceholderContent } from "@/lib/workflow/steps/content-generator-agent";
import { finalizeCampaignContext, runOrchestratorUntilPendingContent } from "@/lib/workflow/orchestrator";

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
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  const visibleSteps = useMemo<WorkflowStepResult[]>(() => {
    if (!context) return [];
    return context.trace.workflowSteps.slice(0, revealedSteps);
  }, [context, revealedSteps]);

  useEffect(() => {
    if (!context || !isRunning) return;

    if (revealedSteps >= context.trace.workflowSteps.length) {
      if (isGeneratingContent) return;
      setIsRunning(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setRevealedSteps((current) => current + 1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [context, isGeneratingContent, isRunning, revealedSteps]);

  async function handleGenerate() {
    const pendingContext = runOrchestratorUntilPendingContent(formValue);
    setContext(pendingContext);
    setRevealedSteps(0);
    setIsRunning(true);
    setIsGeneratingContent(true);

    const finalizedContext = await generateContentForContext(pendingContext);
    setContext(finalizedContext);
    setIsGeneratingContent(false);
  }

  async function handleRegenerateContent() {
    if (!context) return;

    setIsGeneratingContent(true);
    const finalizedContext = await generateContentForContext(context, 0.1);
    setContext(finalizedContext);
    setIsGeneratingContent(false);
    setIsRunning(true);
  }

  async function generateContentForContext(baseContext: CampaignContext, temperatureBoost = 0) {
    const fallbackContent: GeneratedContent = {
      ...buildPlaceholderContent(baseContext),
      temperature: 0.7 + temperatureBoost,
    };

    try {
      const response = await fetch("/api/content-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objective: baseContext.input.campaignGoal,
          audience: baseContext.selections.selectedAudience,
          products: baseContext.selections.selectedProducts,
          strategy: baseContext.outputs.strategy,
          cta: baseContext.outputs.strategy?.ctaRecommendation,
          channels: baseContext.outputs.strategy?.suggestedChannelMix ?? [],
          temperatureBoost,
        }),
      });

      if (!response.ok) {
        return finalizeCampaignContext(baseContext, fallbackContent);
      }

      const payload = await response.json();
      return finalizeCampaignContext(baseContext, payload.content ?? fallbackContent);
    } catch {
      return finalizeCampaignContext(baseContext, fallbackContent);
    }
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
          isGeneratingContent={isGeneratingContent}
        />
        <ResultsDashboardShell
          context={context}
          isGeneratingContent={isGeneratingContent}
          onRegenerateContent={context ? handleRegenerateContent : undefined}
          canRegenerateContent={Boolean(context?.outputs.generatedContent)}
        />
        <ReasoningPanel context={context && !isRunning ? context : null} />
      </div>
    </main>
  );
}
