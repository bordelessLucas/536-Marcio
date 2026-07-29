import { listActivePlans } from "@/features/billing/plan-gate";
import { getMarketingSettings } from "@/features/marketing/data";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { SupplierHero } from "@/components/marketing/SupplierHero";
import { PlansSection, type PlanCard } from "@/components/marketing/PlansSection";
import { WhatsAppCta } from "@/components/marketing/WhatsAppCta";
import { PublicFooter } from "@/components/marketing/PublicFooter";

function supplierFeatures(slug: string): string[] {
  switch (slug) {
    case "fornecedor-free":
      return ["1 cotação interna/mês", "1 categoria do catálogo", "Central de compliance"];
    case "fornecedor-pro":
      return [
        "30 cotações/mês",
        "3 categorias inclusas",
        "Elegível a parcerias com administradoras",
      ];
    case "fornecedor-premium":
      return ["Cotações ilimitadas", "Até 10 categorias + CRM", "Parcerias e prioridade"];
    default:
      return ["Plataforma CotaCondo"];
  }
}

export default async function FornecedoresPage() {
  const [marketing, plans] = await Promise.all([
    getMarketingSettings(),
    listActivePlans("fornecedor"),
  ]);

  const planCards: PlanCard[] = plans.map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    priceCents: plan.priceCents,
    isFree: plan.isFree,
    monthlyQuota: plan.monthlyQuota,
    features: supplierFeatures(plan.slug),
    recommended: plan.slug === "fornecedor-pro",
  }));

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
          subtitle="Do Free ao Premium: mais categorias, elegibilidade a parcerias e CRM no topo da pirâmide."
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
                    title: "Cadastre-se",
                    text: "Empresa, CNPJ e categorias do catálogo oficial.",
                  },
                  {
                    step: "2",
                    title: "Compliance",
                    text: "Envie certidões e acompanhe o status de aprovação.",
                  },
                  {
                    step: "3",
                    title: "Propostas",
                    text: "Receba convites, declina ou envie condições com anexos.",
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
        <WhatsAppCta whatsappUrl={marketing.whatsappUrl} />
      </main>
      <PublicFooter blogUrl={marketing.blogUrl} whatsappUrl={marketing.whatsappUrl} />
    </div>
  );
}
