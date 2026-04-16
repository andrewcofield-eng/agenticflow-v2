import CampaignFormShell from "./campaignformshell";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";

export default function CampaignBuilderShell() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Campaign builder"
        title="Set up the campaign brief"
        description="This shell captures the key strategy inputs that will later feed the supervised workflow."
      />
      <CampaignFormShell />
    </SectionCard>
  );
}
