import { Crumbs, PageHeader, Section } from "@/components/common/section";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Privacy Policy" }
      ]} />
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="How we collect, use, and protect your personal information."
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground">
            This is a demonstration site. No actual data collection or processing occurs.
          </p>
        </div>
      </Section>
    </>
  );
}
