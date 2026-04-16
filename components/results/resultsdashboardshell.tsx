import ResultSectionCard from "./resultsectioncard";
import PageHeader from "@/components/ui/pageheader";
import SectionCard from "@/components/ui/sectioncard";

export default function ResultsDashboardShell() {
  return (
    <SectionCard>
      <PageHeader
        eyebrow="Results dashboard"
        title="Campaign package output shell"
        description="This section previews how recommendations, rationale, generated content, and human review prompts will be organized."
      />

      <div className="results-grid">
        <ResultSectionCard
          title="Campaign summary"
          items={[
            "Campaign name placeholder",
            "Objective placeholder",
            "Target audience placeholder",
            "Audience rationale placeholder",
          ]}
        />
        <ResultSectionCard
          title="Product recommendations"
          items={[
            "1 to 3 recommended products",
            "Why each product fits",
            "Expected use-case alignment",
          ]}
        />
        <ResultSectionCard
          title="Asset recommendations"
          items={[
            "2 to 4 recommended assets",
            "Why each asset fits",
            "Channel suitability notes",
          ]}
        />
        <ResultSectionCard
          title="Messaging strategy"
          items={[
            "Value proposition",
            "Campaign angle",
            "CTA recommendation",
            "Suggested channel mix",
          ]}
        />
        <ResultSectionCard
          title="Generated content"
          items={[
            "Email subject line and body",
            "LinkedIn or social draft",
            "Paid ad headline and supporting copy",
          ]}
        />
        <ResultSectionCard
          title="Human review and explainability"
          items={[
            "Why selections were made",
            "Assumptions and gaps",
            "What a human should review next",
          ]}
        />
      </div>
    </SectionCard>
  );
}
