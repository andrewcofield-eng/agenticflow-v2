"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import type { CampaignContext } from "@/lib/types/orchestrator";
import DecisionSummaryCard from "./decisionsummarycard";
import HumanReviewCard from "./humanreviewcard";
import WorkflowTraceCard from "./workflowtracecard";

type ReasoningPanelProps = {
  context: CampaignContext | null;
};

export default function ReasoningPanel({ context }: ReasoningPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const assumptions = useMemo(
    () => context ? Array.from(new Set(context.trace.assumptions)) : [],
    [context],
  );

  const reasoningPointCount = useMemo(() => {
    if (!context) return 0;

    const workflowReasoning = context.trace.workflowSteps.flatMap((step) => step.reasoning);
    const reviewChecklist = context.outputs.reviewSummary?.humanReviewChecklist ?? [];

    return Array.from(new Set([...workflowReasoning, ...assumptions, ...reviewChecklist])).length;
  }, [assumptions, context]);

  return (
    <SectionCard id="reasoning-panel">
      <PageHeader
        eyebrow="Reasoning panel"
        title="Reasoning & Assumptions"
        description="Deep-dive trace for users who want to inspect intent, context, agent logic, assumptions, and review requirements."
      />

      {!context ? (
        <div className="mini-card">
          <p className="muted">Generate a campaign to view the orchestration trace, assumptions, and review checklist.</p>
        </div>
      ) : (
        <div className="page-stack">
          <button
            type="button"
            className="reasoning-toggle"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
          >
            <div>
              <p className="eyebrow">Level 3 · Deep reasoning</p>
              <h3 style={{ margin: 0 }}>Reasoning & Assumptions</h3>
              <p className="muted" style={{ margin: "6px 0 0" }}>Open the full trace, assumptions, and human review notes.</p>
            </div>

            <div className="workflow-accordion-meta">
              <span className="badge badge-subtle">{reasoningPointCount} reasoning points available</span>
              <span className="workflow-chevron">{isExpanded ? "−" : "+"}</span>
            </div>
          </button>

          {isExpanded ? (
            <div className="page-stack">
              <div className="two-column">
                <div className="mini-card">
                  <p className="eyebrow">User intent</p>
                  <ul className="list">
                    <li><strong>Goal:</strong> {context.input.campaignGoal}</li>
                    <li><strong>Segment:</strong> {context.input.selectedSegmentName}</li>
                    <li><strong>Selected product/category input:</strong> {context.input.selectedProductOrCategory}</li>
                    <li><strong>Theme / channel:</strong> {context.input.selectedTheme ?? "None"}</li>
                  </ul>
                </div>

                <div className="mini-card">
                  <p className="eyebrow">Context assembled</p>
                  <ul className="list">
                    <li>Audience records considered: {context.candidates.audiences.length}</li>
                    <li>Product records considered: {context.candidates.products.length}</li>
                    <li>Asset records considered: {context.candidates.assets.length}</li>
                    <li>Recommended products: {context.selections.selectedProducts.length}</li>
                    <li>Recommended assets: {context.selections.selectedAssets.length}</li>
                    <li>Source mode: {context.meta.sourceMode}</li>
                  </ul>
                </div>
              </div>

              <DecisionSummaryCard context={context} />

              <div className="two-column">
                {context.trace.workflowSteps.map((step) => (
                  <WorkflowTraceCard key={step.stepId} step={step} />
                ))}
              </div>

              <div className="two-column">
                <div className="mini-card">
                  <p className="eyebrow">Assumptions and gaps</p>
                  <ul className="list">
                    {assumptions.map((item, index) => (
                      <li key={`assumption-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                <HumanReviewCard checklist={context.outputs.reviewSummary?.humanReviewChecklist ?? []} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}
