import { Crumbs, PageHeader, Section } from "@/components/common/section";

export default function TermsPage() {
  return (
    <>
      <Crumbs items={[
        { label: "Home", href: "/" },
        { label: "Terms of Service" }
      ]} />
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        description="Terms and conditions for using our website and services."
      />
      <Section>
        <div className="prose prose-lg max-w-3xl">
          <p className="text-muted-foreground">
            This is a demonstration site. These terms are for display purposes only.
          </p>
        </div>
      </Section>
    </>
  );
}
