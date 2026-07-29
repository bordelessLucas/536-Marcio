import { listActivePlans } from "@/features/billing/plan-gate";
import { getActiveBanners, getMarketingSettings } from "@/features/marketing/data";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { LandingHero } from "@/components/marketing/LandingHero";
import { BannerCarousel } from "@/components/marketing/BannerCarousel";
import { PlansSection, type PlanCard } from "@/components/marketing/PlansSection";
import { WhatsAppCta } from "@/components/marketing/WhatsAppCta";
import { PublicFooter } from "@/components/marketing/PublicFooter";

function solicitanteFeatures(slug: string): string[] {
  switch (slug) {
    case "sindico-free":
      return ["15 cotações/mês", "Comparativo na plataforma", "Negociar e aprovar online"];
    case "sindico-pago":
      return ["50 cotações/mês", "Whitelabel no comparativo", "Prioridade de suporte"];
    case "adm-free":
      return ["15 cotações/mês", "Multi-condomínios", "Equipe operacional"];
    case "adm-pago":
      return ["80 cotações/mês", "Whitelabel", "Ideal para migração Síndico→Adm"];
    case "adm-premium":
      return [
        "Cotações ilimitadas",
        "Favoritos + parcerias",
        "Comissionamento e SLA",
      ];
    default:
      return ["Plataforma CotaCondo"];
  }
}

export default async function HomePage() {
  const [marketing, banners, plans] = await Promise.all([
    getMarketingSettings(),
    getActiveBanners(),
    listActivePlans("solicitante"),
  ]);

  const planCards: PlanCard[] = plans
    .filter((plan) =>
      ["sindico-free", "sindico-pago", "adm-premium"].includes(plan.slug),
    )
    .map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      isFree: plan.isFree,
      monthlyQuota: plan.monthlyQuota,
      features: solicitanteFeatures(plan.slug),
      recommended: plan.slug === "adm-premium",
    }));

  // Garante ordem Free / Pago / Premium na home
  const order = ["sindico-free", "sindico-pago", "adm-premium"];
  planCards.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_8%,rgba(192,38,211,0.1),transparent_32%),radial-gradient(circle_at_90%_12%,rgba(6,182,212,0.1),transparent_28%),#ffffff]">
      <PublicHeader blogUrl={marketing.blogUrl} />
      <main>
        <LandingHero />
        <BannerCarousel
          banners={banners.map((item) => ({
            id: item.id,
            title: item.title,
            imageUrl: item.imageUrl,
            linkUrl: item.linkUrl,
          }))}
        />
        <PlansSection
          title="Escolha o plano do solicitante"
          subtitle="Free para começar. Pago e Premium para escala, whitelabel e operação de administradora."
          plans={planCards}
          audience="solicitante"
        />
        <WhatsAppCta whatsappUrl={marketing.whatsappUrl} />
      </main>
      <PublicFooter blogUrl={marketing.blogUrl} whatsappUrl={marketing.whatsappUrl} />
    </div>
  );
}
