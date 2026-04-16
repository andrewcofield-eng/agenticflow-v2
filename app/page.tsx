import Hero from "@/components/landing/hero";
import ProjectSummary from "@/components/landing/projectsummary";

export default function HomePage() {
  return (
    <main className="page-shell">
      <Hero />
      <ProjectSummary />
    </main>
  );
}
