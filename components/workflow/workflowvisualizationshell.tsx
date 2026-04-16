"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import type { ReviewSummary, StrategyOutput } from "@/lib/types/campaign";
import type { Asset } from "@/lib/types/asset";
import type { Audience } from "@/lib/types/audience";
import type { Product } from "@/lib/types/product";
import type { WorkflowStepResult } from "@/lib/types/workflow";
import OrchestratorPanel from "./orchestratorpanel";

type WorkflowVisualizationShellProps = {
  steps: WorkflowStepResult[];
  isRunning: boolean;
  currentStepIndex: number;
  isGeneratingContent?: boolean;
};

type WorkflowStepDefinition = {
  stepId: string;
  stepName: string;
};

type AudienceStepData = {
  selectedAudience: Audience;
  topScore: number;
};

type ProductStepData = {
  selectedProducts: Product[];
};

type AssetStepData = {
  selectedAssets: Asset[];
};

type StrategyStepData = {
  strategy: StrategyOutput;
};

type ContentStepData = {
  generatedContent: {
    emailSubject: string;
    socialPost: string;
    adHeadline: string;
  };
};

type ReviewStepData = {
  reviewSummary: ReviewSummary;
};

const workflowSteps: WorkflowStepDefinition[] = [
  { stepId: "audience-agent", stepName: "Audience Agent" },
  { stepId: "product-match-agent", stepName: "Product Match Agent" },
  { stepId: "asset-selection-agent", stepName: "Asset Selection Agent" },
  { stepId: "campaign-strategist-agent", stepName: "Campaign Strategist" },
  { stepId: "content-generator-agent", stepName: "Content Generator" },
  { stepId: "review-agent", stepName: "Review Agent" },
];

export default function WorkflowVisualizationShell({ steps, isRunning, currentStepIndex }: WorkflowVisualizationShellProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const stepMap = useMemo(() => new Map(steps.map((step) => [step.stepId, step])), [steps]);
  const activeStepId = isRunning ? steps[currentStepIndex]?.stepId : undefined;

  return (
    <SectionCard>
      <PageHeader
        eyebrow="Orchestrator workflow"
        title="The central orchestrator coordinates each specialist module"
        description="This panel shows the campaign flow progressing step by step, with visible outputs and reasoning from each module."
      />

      <OrchestratorPanel steps={steps} isRunning={isRunning} currentStepIndex={currentStepIndex} />

      <div className="workflow-accordion" style={{ marginTop: 20 }}>
        {workflowSteps.map((definition, index) => {
          const step = stepMap.get(definition.stepId);
          const isExpanded = expandedStepId === definition.stepId;
          const isActive = activeStepId === definition.stepId;
          const isComplete = step?.status === "complete";
          const statusLabel = isActive ? "Running" : isComplete ? "Complete" : "Pending";

          return (
            <div
              key={definition.stepId}
              className="workflow-accordion-item"
              style={{ borderColor: isExpanded || isActive ? "rgba(125, 211, 252, 0.35)" : undefined }}
            >
              <button
                type="button"
                className="workflow-accordion-trigger"
                onClick={() => setExpandedStepId((current) => current === definition.stepId ? null : definition.stepId)}
                aria-expanded={isExpanded}
              >
                <div className="workflow-step-heading">
                  <span className="workflow-step-number">{index + 1}</span>
                  <div>
                    <p className="eyebrow">Step {index + 1}</p>
                    <h3>{definition.stepName}</h3>
                  </div>
                </div>

                <div className="workflow-accordion-meta">
                  <span className={`badge ${isComplete ? "badge-success" : isActive ? "badge-info" : "badge-subtle"}`}>{isComplete ? "✓ Complete" : statusLabel}</span>
                  <span className="workflow-chevron">{isExpanded ? "−" : "+"}</span>
                </div>
              </button>

              {isExpanded ? (
                <div className="workflow-accordion-content">
                  {renderStepDetails(definition.stepId, step)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function renderStepDetails(stepId: string, step?: WorkflowStepResult) {
  if (!step) {
    return <p className="muted">This step will populate once the orchestrator reaches it.</p>;
  }

  switch (stepId) {
    case "audience-agent": {
      const data = step.data as AudienceStepData;
      return (
        <ul className="list" style={{ marginTop: 0 }}>
          <li><strong>Selected audience:</strong> {data.selectedAudience?.name ?? "Not selected"}</li>
          <li><strong>Selection score:</strong> {data.topScore ?? "Not available"}</li>
        </ul>
      );
    }
    case "product-match-agent": {
      const data = step.data as ProductStepData;
      return (
        <div className="summary-list-stack">
          <p style={{ margin: 0 }}><strong>{data.selectedProducts?.length ?? 0} products recommended</strong></p>
          <ul className="list" style={{ marginTop: 0 }}>
            {(data.selectedProducts ?? []).map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        </div>
      );
    }
    case "asset-selection-agent": {
      const data = step.data as AssetStepData;
      return (
        <div className="summary-list-stack">
          <p style={{ margin: 0 }}><strong>{data.selectedAssets?.length ?? 0} assets recommended</strong></p>
          <ul className="list" style={{ marginTop: 0 }}>
            {(data.selectedAssets ?? []).map((asset) => (
              <li key={asset.id}>{asset.title}</li>
            ))}
          </ul>
        </div>
      );
    }
    case "campaign-strategist-agent": {
      const data = step.data as StrategyStepData;
      return (
        <ul className="list" style={{ marginTop: 0 }}>
          <li><strong>Campaign name:</strong> {data.strategy?.campaignName ?? "Not generated"}</li>
          <li><strong>CTA:</strong> {data.strategy?.ctaRecommendation ?? "Not generated"}</li>
          <li><strong>Channels:</strong> {data.strategy?.suggestedChannelMix?.join(", ") ?? "Not generated"}</li>
        </ul>
      );
    }
    case "content-generator-agent": {
      const data = step.data as ContentStepData;
      return (
        <div className="summary-list-stack">
          {step.status === "running" ? (
            <div className="loading-inline">
              <span className="loading-spinner" />
              <p className="muted" style={{ margin: 0 }}>Generating content with the configured OpenAI service...</p>
            </div>
          ) : null}
          <div className="badge-row">
            <span className={`badge ${data.generatedContent?.emailSubject ? "badge-success" : ""}`}>Email ✓</span>
            <span className={`badge ${data.generatedContent?.socialPost ? "badge-success" : ""}`}>Social ✓</span>
            <span className={`badge ${data.generatedContent?.adHeadline ? "badge-success" : ""}`}>Ad ✓</span>
          </div>
        </div>
      );
    }
    case "review-agent": {
      const data = step.data as ReviewStepData;
      return (
        <div className="summary-list-stack">
          <p style={{ margin: 0 }}>
            <strong>Review status:</strong> {data.reviewSummary?.finalReviewStatus === "ready-for-review" ? "Draft ready for human review" : "Needs attention"}
          </p>
          <ul className="list" style={{ marginTop: 0 }}>
            {(data.reviewSummary?.humanReviewChecklist ?? []).slice(0, 3).map((item, index) => (
              <li key={`review-item-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    default:
      return <p className="muted">Step details unavailable.</p>;
  }
}
