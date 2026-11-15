import { Crumbs, PageHeader, Section } from "@/components/common/section";

export default function CookiePolicyPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Cookie Policy" }
      ]} />
      <PageHeader
        eyebrow="Legal"
        title="Cookie policy"
        description="How we use cookies and similar technologies."
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground">
            This is a demonstration site. Cookie usage information for display purposes only.
          </p>
        </div>
      </Section>
    </>
  );
}
