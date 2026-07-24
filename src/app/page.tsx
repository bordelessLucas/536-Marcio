import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Mascot } from "@/components/brand/Mascot";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(192,38,211,0.12),transparent_35%),radial-gradient(circle_at_90%_20%,rgba(6,182,212,0.12),transparent_30%),#ffffff]">
      <PublicHeader />
      <main className="pt-28 pb-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <section className="lg:col-span-5">
              <div className="inline-flex w-fit items-center rounded-full border border-black/5 bg-black/[0.04] px-3 py-1.5 text-xs text-black/80">
                Cotações, negociação e contratação 100% na plataforma
              </div>
              <h1 className="mt-6 text-[36px] font-extrabold leading-[1.1] tracking-tight text-black sm:text-[44px] lg:text-[56px]">
                Cotações de condomínio
                <br />
                sem planilha. Sem WhatsApp solto.
              </h1>
              <p className="mt-5 max-w-[480px] text-lg leading-relaxed tracking-tight text-black/60">
                Abra a cotação, receba propostas de fornecedores elegíveis, compare, negocie e aprove —
                com franquia por plano, compliance e rastreio completo.
              </p>
              <div id="cotacao" className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/cadastro">
                  <Button size="lg" className="pl-6 pr-2">
                    Fazer cotação
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#9333EA]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </Link>
                <Link href="/fornecedores" className="text-sm font-bold text-[#9333EA] hover:underline">
                  Sou fornecedor
                </Link>
              </div>
            </section>

            <section className="relative flex items-center justify-center lg:col-span-7 lg:justify-end">
              <div className="pointer-events-none absolute top-[20%] left-[15%] -z-10 h-[360px] w-[360px] rounded-full bg-fuchsia-400/15 blur-[110px]" />
              <div className="pointer-events-none absolute bottom-[10%] right-[10%] -z-10 h-[280px] w-[280px] rounded-full bg-cyan-400/15 blur-[100px]" />
              <Mascot priority className="relative z-10 max-w-[460px]" />
            </section>
          </div>

          <p className="mt-16 text-center text-sm text-neutral-500">
            Landing completa (banner, planos, WhatsApp) no Dia 7 · Fundação Dia 1 pronta
          </p>
        </Container>
      </main>
    </div>
  );
}
