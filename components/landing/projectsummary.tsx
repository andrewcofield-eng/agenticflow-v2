import SectionCard from "@/components/ui/sectioncard";
import PageHeader from "@/components/ui/pageheader";

export default function ProjectSummary() {
  return (
    <SectionCard id="project-summary">
      <PageHeader
        eyebrow="Prototype overview"
        title="What happens when AI assembles campaigns from connected systems of record?"
        description="This concept prototype shows a supervised workflow that reviews audience context, product context, and asset context before producing a campaign package with rationale and draft content."
      />

      <div className="two-column">
        <div className="mini-card">
          <h3>What the app shows</h3>
          <ul className="list">
            <li>A campaign builder for goals, segment focus, and product direction</li>
            <li>Source data panels for CRM, PIM, and DAM inputs</li>
            <li>A visible multi-step workflow with distinct agent roles</li>
            <li>A results dashboard with rationale and draft channel content</li>
          </ul>
        </div>

        <div className="mini-card">
          <h3>What the app does not do</h3>
          <ul className="list">
            <li>No production SaaS complexity</li>
            <li>No autonomous publishing or write-back</li>
            <li>No authentication or database setup</li>
            <li>No live integrations in this phase</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
