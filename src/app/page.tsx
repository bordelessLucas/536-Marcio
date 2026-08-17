import { listActivePlans } from "@/features/billing/plan-gate";
import { getActiveBanners, getMarketingSettings } from "@/features/marketing/data";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { LandingHero } from "@/components/marketing/LandingHero";
import { BannerCarousel } from "@/components/marketing/BannerCarousel";
import { PlansSection, type PlanCard } from "@/components/marketing/PlansSection";
import { WhatsAppCta } from "@/components/marketing/WhatsAppCta";
import { PublicFooter } from "@/components/marketing/PublicFooter";

const FREE_FEATURES = [
  "Até 15 cotações/mês",
  "Comparativo na plataforma",
  "Negociar e aprovar online",
] as const;

const BASIC_FEATURES = [
  ...FREE_FEATURES,
  "Whitelabel no comparativo",
  "Consulte Adicionais",
] as const;

const PREMIUM_FEATURES = [
  ...BASIC_FEATURES,
  "Gestão de Parcerias",
  "Comissionamento por fornecedor",
  "SLA de solicitações",
  "Gestão do processo",
] as const;

const SERVICE_FEATURES = [
  "Cotação gerenciada ponta a ponta pela CotaCondo",
  "Portal whitelabel para solicitantes",
  "Análise RIF comparativa sob demanda",
  "Equipe Master Service com pipeline completo",
  "Redução de custo operacional e escala",
] as const;

const DISPLAY: Record<
  string,
  {
    name: string;
    description: string;
    priceCents: number;
    monthlyQuota: number | null;
    features: string[];
  }
> = {
  "sindico-free": {
    name: "Cota Free",
    description: "Até 15 cotações para começar com governança.",
    priceCents: 0,
    monthlyQuota: 15,
    features: [...FREE_FEATURES],
  },
  "sindico-pago": {
    name: "Cota Basic",
    description: "Escala a operação com os recursos do Free e adicionais.",
    priceCents: 39990,
    monthlyQuota: 50,
    features: [...BASIC_FEATURES],
  },
  "adm-premium": {
    name: "Cota Premium",
    description: "Operação completa de administradora com gestão de ponta a ponta.",
    priceCents: 68990,
    monthlyQuota: null,
    features: [...PREMIUM_FEATURES],
  },
  "cota-service": {
    name: "Cota Service",
    description:
      "Cuidamos de todo o processo de compras da sua administradora de ponta a ponta com inteligência, transparência e gestão.",
    priceCents: 0,
    monthlyQuota: null,
    features: [...SERVICE_FEATURES],
  },
};

function buildCotaServiceWhatsAppUrl(baseUrl: string) {
  const message =
    "Olá! Sou um cliente interessado no plano Cota Service da CotaCondo. Gostaria de falar com um consultor para entender o plano personalizado de cotação gerenciada.";
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return `https://wa.me/5500000000000?text=${encodeURIComponent(message)}`;
  }
}

export default async function HomePage() {
  const [marketing, banners, plans] = await Promise.all([
    getMarketingSettings(),
    getActiveBanners(),
    listActivePlans("solicitante"),
  ]);

  const serviceWhatsApp = buildCotaServiceWhatsAppUrl(marketing.whatsappUrl);

  const planCards: PlanCard[] = plans
    .filter((plan) =>
      ["sindico-free", "sindico-pago", "adm-premium", "cota-service"].includes(plan.slug),
    )
    .map((plan) => {
      const display = DISPLAY[plan.slug];
      const isService = plan.slug === "cota-service";
      return {
        slug: plan.slug,
        name: display?.name ?? plan.name,
        description: display?.description ?? plan.description,
        priceCents: display?.priceCents ?? plan.priceCents,
        isFree: plan.isFree,
        monthlyQuota: display?.monthlyQuota ?? plan.monthlyQuota,
        features: display?.features ?? ["Plataforma CotaCondo"],
        recommended: plan.slug === "adm-premium",
        ...(isService
          ? {
              consultPrice: true,
              hideQuota: true,
              ctaLabel: "Falar com Consultor",
              ctaHref: serviceWhatsApp,
            }
          : {}),
      };
    });

  const order = ["sindico-free", "sindico-pago", "adm-premium", "cota-service"];
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
          title="Escolha um plano e otimize a sua operação de compras."
          subtitle="Com os planos CotaCondo você ganha tempo, mais segurança e gestão de ponta a ponta na administradora."
          plans={planCards}
          audience="solicitante"
        />
        <WhatsAppCta whatsappUrl={marketing.whatsappUrl} />
      </main>
      <PublicFooter blogUrl={marketing.blogUrl} whatsappUrl={marketing.whatsappUrl} />
    </div>
  );
}
