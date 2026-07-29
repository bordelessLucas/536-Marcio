"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ClipboardList, Columns2 } from "lucide-react";
import { Mascot } from "@/components/brand/Mascot";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const BADGES = [
  {
    title: "Abrir cotação",
    subtitle: "com meta de propostas",
    icon: ClipboardList,
    accent: "text-[#E11D8A] bg-[#E11D8A]/10",
    className: "top-[8%] right-[4%] lg:right-[8%]",
    delay: 0.6,
    duration: 4.8,
  },
  {
    title: "Comparar propostas",
    subtitle: "quadro side-by-side",
    icon: Columns2,
    accent: "text-[#14B8A6] bg-[#14B8A6]/10",
    className: "top-[42%] left-0 lg:left-[-2%]",
    delay: 0.8,
    duration: 5.0,
  },
  {
    title: "Aprovar ou negociar",
    subtitle: "100% na plataforma",
    icon: BadgeCheck,
    accent: "text-[#9333EA] bg-[#9333EA]/10",
    className: "bottom-[6%] right-[2%] lg:right-[6%]",
    delay: 1.0,
    duration: 5.5,
  },
] as const;

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 lg:pt-32 lg:pb-20">
      <div className="pointer-events-none absolute top-[8%] left-[6%] -z-10 h-[420px] w-[420px] rounded-full bg-[#C026D3]/[0.14] blur-[100px]" />
      <div className="pointer-events-none absolute right-[4%] bottom-[4%] -z-10 h-[380px] w-[380px] rounded-full bg-[#06B6D4]/[0.14] blur-[120px]" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="inline-flex w-fit items-center rounded-full border border-black/5 bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-black/80">
              Cotações, negociação e contratação 100% na plataforma
            </div>
            <h1 className="mt-6 text-[36px] font-extrabold leading-[1.1] tracking-[-0.04em] text-[#0A0A0A] sm:text-[44px] lg:text-[56px]">
              Cotações de condomínio
              <br />
              sem planilha. Sem WhatsApp solto.
            </h1>
            <p className="mt-5 max-w-[480px] text-lg leading-relaxed tracking-[-0.01em] text-black/60">
              Abra a cotação, receba propostas de fornecedores elegíveis, compare, negocie e aprove —
              com franquia por plano, compliance e rastreio completo.
            </p>
            <div id="cotacao" className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/cadastro?tipo=sindico">
                  <Button size="lg" className="group pl-6 pr-2">
                    Fazer cotação
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#9333EA] transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </Link>
              </motion.div>
              <Link
                href="/fornecedores"
                className="text-sm font-bold text-[#9333EA] transition-colors hover:text-[#7C22CE]"
              >
                Sou fornecedor
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center lg:col-span-7 lg:justify-end"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-[#D946EF]/30"
              style={{
                background:
                  "conic-gradient(from 180deg, transparent, rgba(225,29,138,0.08), transparent, rgba(6,182,212,0.08), transparent)",
              }}
            />
            <Mascot priority className="relative z-10 max-w-[460px]" />

            {BADGES.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.title}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: [0, -9, 0], scale: 1 }}
                  transition={{
                    opacity: { delay: badge.delay, duration: 0.5 },
                    scale: {
                      delay: badge.delay,
                      type: "spring",
                      damping: 20,
                      stiffness: 100,
                    },
                    y: {
                      delay: badge.delay + 0.4,
                      duration: badge.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.05 }}
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
