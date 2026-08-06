import { listActivePlans } from "@/features/billing/plan-gate";
import { getMarketingSettings } from "@/features/marketing/data";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { SupplierHero } from "@/components/marketing/SupplierHero";
import { PlansSection, type PlanCard } from "@/components/marketing/PlansSection";
import { WhatsAppCta } from "@/components/marketing/WhatsAppCta";
import { PublicFooter } from "@/components/marketing/PublicFooter";

const DISPLAY: Record<
  string,
  {
    name: string;
    description: string;
    priceCents?: number;
    monthlyQuota: number | null;
    features: string[];
    recommended?: boolean;
    consultPrice?: boolean;
    hideQuota?: boolean;
    ctaLabel?: string;
  }
> = {
  "fornecedor-free": {
    name: "Condo Free",
    description: "Comece a receber oportunidades com franquia inicial.",
    priceCents: 0,
    monthlyQuota: 5,
    features: [
      "5 cotações internas/mês",
      "1 categoria do catálogo",
      "Gestão de oportunidades",
    ],
  },
  "fornecedor-pro": {
    name: "Condo Basic",
    description: "Mais volume, categorias e elegibilidade a parcerias.",
    monthlyQuota: 30,
    features: [
      "CRM",
      "30 cotações/mês",
      "3 categorias inclusas",
      "Elegível a parcerias com administradoras",
      "Consulte Adicionais",
    ],
    recommended: true,
  },
  "fornecedor-premium": {
    name: "Condo Premium",
    description: "Escala máxima com categorias amplas e CRM.",
    monthlyQuota: 150,
    features: [
      "Cotações ilimitadas",
      "Até 5 categorias",
      "CRM",
      "150 cotações/mês",
      "Elegível a parcerias com administradoras",
      "Consulte Adicionais",
    ],
  },
  "fornecedor-vip": {
    name: "Plano VIP",
    description: "Adicionais sob relacionamento comercial, sem alterar a lógica do produto.",
    monthlyQuota: null,
    features: ["Consulte Banner Patrocinado", "Consulte Campanhas de ativação"],
    consultPrice: true,
    hideQuota: true,
    ctaLabel: "Fale com um consultor",
  },
};

export default async function FornecedoresPage() {
  const [marketing, plans] = await Promise.all([
    getMarketingSettings(),
    listActivePlans("fornecedor"),
  ]);

  const bySlug = new Map(plans.map((plan) => [plan.slug, plan]));

  const planCards: PlanCard[] = [];
  for (const slug of [
    "fornecedor-free",
    "fornecedor-pro",
    "fornecedor-premium",
    "fornecedor-vip",
  ] as const) {
    const plan = bySlug.get(slug);
    const display = DISPLAY[slug];
    if (!display) continue;
    if (!plan && slug !== "fornecedor-vip") continue;

    planCards.push({
      slug,
      name: display.name,
      description: display.description,
      priceCents: display.priceCents ?? plan?.priceCents ?? 0,
      isFree: plan?.isFree ?? false,
      monthlyQuota: display.monthlyQuota,
      features: display.features,
      recommended: display.recommended ?? false,
      consultPrice: display.consultPrice,
      hideQuota: display.hideQuota,
      ctaLabel: display.ctaLabel,
      ctaHref: slug === "fornecedor-vip" ? marketing.whatsappUrl : undefined,
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_8%,rgba(192,38,211,0.11),transparent_34%),radial-gradient(circle_at_10%_40%,rgba(6,182,212,0.08),transparent_30%),#ffffff]">
      <PublicHeader blogUrl={marketing.blogUrl} />
      {marketing.pixelScripts ? (
        <div dangerouslySetInnerHTML={{ __html: marketing.pixelScripts }} />
      ) : null}
      <main>
        <SupplierHero />
        <PlansSection
          id="planos-fornecedor"
          title="Planos para fornecedores"
          subtitle="Do Free ao Premium: mais categorias, elegibilidade a parcerias e CRM. VIP para ativação comercial."
          plans={planCards}
          audience="fornecedor"
        />
        <section className="pb-8">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-12 lg:px-20">
            <div className="rounded-[28px] border border-black/5 bg-white/80 p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#0A0A0A]">Como funciona</h2>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "1",
                    title: "Cadastro",
                    text: "Cadastre sua empresa",
                  },
                  {
                    step: "2",
                    title: "Validação",
                    text: "Envie seus documentos",
                  },
                  {
                    step: "3",
                    title: "Oportunidades",
                    text: "Receba oportunidades, aceite, recuse e seja avisado sobre a finalização do processo.",
                  },
                ].map((item) => (
                  <li key={item.step} className="rounded-2xl border border-black/5 p-4">
                    <p className="text-sm font-semibold text-[#9333EA]">Passo {item.step}</p>
                    <p className="mt-1 font-bold text-[#0A0A0A]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#6B7280]">{item.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <WhatsAppCta
          whatsappUrl={marketing.whatsappUrl}
          title="Fale com um consultor"
          description="Aumente seu potencial de vendas, se conecte com administradoras e síndicos de todo o Brasil. Tire suas dúvidas."
        />
      </main>
      <PublicFooter
        blogUrl={marketing.blogUrl}
        whatsappUrl={marketing.whatsappUrl}
        description="Sua empresa amplia oportunidades, se conecta com potenciais clientes e se torna referência."
      />
    </div>
  );
}
