import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";

export default function CampaignBuilderShell() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Campaign builder"
        title="Set up the campaign brief"
        description="Set the campaign goal, segment, product focus, and theme, then let the AgenticFlow Orchestrator assemble a supervised campaign package from connected CRM, PIM, and DAM context."
      />
    </SectionCard>
  );
}
