import WorkflowStepCard from "./workflowstepcard";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";

const workflowSteps = [
  {
    name: "Audience Agent",
    description: "Validates or recommends the best-fit segment for the campaign objective.",
  },
  {
    name: "Product Match Agent",
    description: "Scores which products best fit the selected audience and goal.",
  },
  {
    name: "Asset Selection Agent",
    description: "Surfaces assets that match the products, audience, and channel plan.",
  },
  {
    name: "Campaign Strategist",
    description: "Drafts the angle, positioning, CTA direction, and value proposition.",
  },
  {
    name: "Content Generator",
    description: "Creates channel-specific copy drafts for the assembled campaign package.",
  },
  {
    name: "Review Agent",
    description: "Checks for completeness, consistency, explainability, and review needs.",
  },
];

export default function WorkflowVisualizationShell() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Supervised workflow"
        title="The agent flow is visible, modular, and reviewable"
        description="This shell makes the multi-step process understandable. Later phases will connect these stages to recommendation and content generation logic."
      />

      <div className="workflow-grid">
        {workflowSteps.map((step, index) => (
          <WorkflowStepCard
            key={step.name}
            index={index + 1}
            title={step.name}
            description={step.description}
          />
        ))}
      </div>
    </SectionCard>
  );
}
