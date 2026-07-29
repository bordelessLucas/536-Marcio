"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, Handshake, Inbox } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useEffect } from "react";

const BADGES = [
  {
    title: "Receber oportunidades",
    subtitle: "por categoria e plano",
    icon: Inbox,
    accent: "text-[#E11D8A] bg-[#E11D8A]/10",
    className: "top-[10%] right-[2%]",
    delay: 0.55,
  },
  {
    title: "Enviar proposta",
    subtitle: "múltiplas condições",
    icon: FileCheck2,
    accent: "text-[#14B8A6] bg-[#14B8A6]/10",
    className: "top-[48%] left-[-2%]",
    delay: 0.75,
  },
  {
    title: "Plano Pro / parceria",
    subtitle: "elegível a administradoras",
    icon: Handshake,
    accent: "text-[#9333EA] bg-[#9333EA]/10",
    className: "bottom-[8%] right-[4%]",
    delay: 0.95,
  },
] as const;

export function SupplierHero() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      const value = params.get(key);
      if (value) utm[key] = value;
    }
    if (Object.keys(utm).length > 0) {
      window.sessionStorage.setItem("cotacondo_utm", JSON.stringify(utm));
    }
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div className="pointer-events-none absolute top-[10%] right-[8%] -z-10 h-[400px] w-[400px] rounded-full bg-[#C026D3]/[0.14] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[6%] left-[6%] -z-10 h-[320px] w-[320px] rounded-full bg-[#06B6D4]/[0.12] blur-[110px]" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">
              Para Fornecedores
            </p>
            <h1 className="mt-3 text-[36px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#0A0A0A] sm:text-[44px] lg:text-[52px]">
              Receba oportunidades de condomínios com compliance e o plano certo.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-black/60">
              Envie propostas com múltiplas condições, acompanhe o funil em Kanban e desbloqueie
              parcerias com administradoras no plano Intermediário ou Premium.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/cadastro?tipo=fornecedor">
                <Button size="lg" className="group pl-6 pr-2">
                  Criar conta de fornecedor
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#9333EA] transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
              <Link href="/checkout?plan=fornecedor-pro" className="text-sm font-bold text-[#9333EA]">
                Ver plano Intermediário
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex justify-center lg:col-span-6"
          >
            <Mascot variant="avatar" priority className="relative z-10 h-56 w-56 sm:h-64 sm:w-64" />
            {BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: [0, -8, 0] }}
                  transition={{
                    opacity: { delay: badge.delay, duration: 0.45 },
                    y: {
                      delay: badge.delay + 0.3,
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  className={`absolute z-20 hidden sm:block ${badge.className}`}
                >
                  <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-white/85 to-white/55 px-3.5 py-3 shadow-[0_10px_30px_-12px_rgba(147,51,234,0.28)] backdrop-blur-[24px]">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${badge.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{badge.title}</p>
                      <p className="text-xs text-[#6B7280]">{badge.subtitle}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
