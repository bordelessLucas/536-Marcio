import { notFound } from "next/navigation";
import { getServiceClientBySlug } from "@/features/external-approver/data";
import { ServiceClientLoginForm } from "@/features/external-approver/components/ServiceClientLoginForm";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ServiceClientLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const serviceClient = await getServiceClientBySlug(slug);
  if (!serviceClient) notFound();

  return (
    <ServiceClientLoginForm
      slug={slug}
      displayName={serviceClient.displayName}
      primaryColor={serviceClient.primaryColor}
      secondaryColor={serviceClient.secondaryColor}
      logoUrl={serviceClient.logoUrl}
    />
  );
}
