import SourcePanelCard from "./sourcepanelcard";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";
import { mockAssets } from "@/lib/data/mock-data/assets";
import { mockAudiences } from "@/lib/data/mock-data/audiences";
import { mockProducts } from "@/lib/data/mock-data/products";

export default function SourceDataPanelsShell() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Source context"
        title="Visible data inputs from CRM, PIM, and DAM"
        description="These panels show the kinds of source records the workflow will draw from. In this phase, all data is mocked and normalized for display."
      />

      <div className="source-grid">
        <SourcePanelCard
          systemName="HubSpot"
          systemType="CRM"
          summary="Audience segments, lifecycle stages, engagement signals, and audience fit metadata."
          items={mockAudiences.map((audience) => audience.name)}
        />
        <SourcePanelCard
          systemName="Directus"
          systemType="PIM"
          summary="Product categories, benefits, audience fit tags, and messaging themes."
          items={mockProducts.map((product) => product.name)}
        />
        <SourcePanelCard
          systemName="Cloudinary"
          systemType="DAM"
          summary="Asset metadata, channel suitability, campaign fit, and product associations."
          items={mockAssets.map((asset) => asset.title)}
        />
      </div>
    </SectionCard>
  );
}
