import { Crumbs, PageHeader, Section } from "@/components/common/section";

export default function OurStoryPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Our Story" }
      ]} />
      <PageHeader
        eyebrow="About"
        title="Our story"
        description="How we became experts in made-to-measure window treatments."
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Since 1998, we've been helping homeowners transform their spaces with custom window treatments.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            What started as a small workshop has grown into a trusted name in made-to-measure curtains, shades, and blinds.
          </p>
        </div>
      </Section>
    </>
  );
}
