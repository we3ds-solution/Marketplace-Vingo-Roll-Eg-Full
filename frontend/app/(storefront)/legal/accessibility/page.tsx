import { Crumbs, PageHeader, Section } from "@/components/common/section";

export default function AccessibilityPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Accessibility" }
      ]} />
      <PageHeader
        eyebrow="Legal"
        title="Accessibility statement"
        description="Our commitment to digital accessibility."
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground">
            We are committed to ensuring digital accessibility for people with disabilities.
          </p>
        </div>
      </Section>
    </>
  );
}
