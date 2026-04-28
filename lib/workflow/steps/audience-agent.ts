import type { Audience } from "@/lib/types/audience";
import type { CampaignContext } from "@/lib/types/orchestrator";
import type { WorkflowStepResult } from "@/lib/types/workflow";

type AudienceStepData = {
  selectedAudience: Audience;
  topScore: number;
};

export function runAudienceAgent(context: CampaignContext): WorkflowStepResult<AudienceStepData> {
  const { selectedSegmentName, selectedProductOrCategory, campaignGoal, selectedTheme } = context.input;

  const scored = context.candidates.audiences.map((audience) => {
    let score = 0;
    const reasons: string[] = [];

    if (audience.name === selectedSegmentName) {
      score += 5;
      reasons.push("Direct match with the selected segment");
    }

    const productText = selectedProductOrCategory.toLowerCase();
    if (audience.productInterestTags.some((tag) => productText.includes(tag.toLowerCase()) || tag.toLowerCase().includes(productText))) {
      score += 3;
      reasons.push("Audience interest tags overlap with the selected product focus");
    }

    if (campaignGoal.toLowerCase().includes("upsell") && audience.lifecycleStage.toLowerCase().includes("customer")) {
      score += 3;
      reasons.push("Lifecycle stage supports an upsell goal");
    }

    if (campaignGoal.toLowerCase().includes("re-engage") && ["medium", "high"].includes(audience.engagementLevel.toLowerCase())) {
      score += 2;
      reasons.push("Engagement level supports a re-engagement campaign");
    }

    if (campaignGoal.toLowerCase().includes("awareness") && audience.size) {
      score += 1;
      reasons.push("Audience size can support an awareness-oriented campaign");
    }

    if (selectedTheme && audience.description.toLowerCase().includes(selectedTheme.toLowerCase().split(" ")[0])) {
      score += 1;
      reasons.push("Theme appears directionally relevant to the audience context");
    }

    if (audience.intentSignals.length > 0) {
      score += 1;
      reasons.push("Audience includes usable intent signals");
    }

    return { audience, score, reasons };
  });

  const top = [...scored].sort((a, b) => b.score - a.score)[0];

  return {
    stepId: "audience-agent",
    stepName: "Audience Agent",
    status: "complete",
    inputSummary: [
      `Campaign goal: ${campaignGoal}`,
      `Selected segment: ${selectedSegmentName}`,
      `Candidates considered: ${context.candidates.audiences.length}`,
    ],
    outputSummary: [`Selected audience: ${top.audience.name}`, `Selection score: ${top.score}`],
    reasoning: top.reasons,
    assumptions: ["Audience fit is based on deterministic scoring over normalized source records and tag overlap."],
    confidence: top.score >= 7 ? "high" : top.score >= 4 ? "medium" : "low",
    data: {
      selectedAudience: top.audience,
      topScore: top.score,
    },
  };
}
