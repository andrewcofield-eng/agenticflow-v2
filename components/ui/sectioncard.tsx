import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  id?: string;
};

export default function SectionCard({ children, id }: SectionCardProps) {
  return (
    <section className="section-card" id={id}>
      {children}
    </section>
  );
}
