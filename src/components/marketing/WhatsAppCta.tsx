import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type WhatsAppCtaProps = {
  whatsappUrl: string;
};

export function WhatsAppCta({ whatsappUrl }: WhatsAppCtaProps) {
  return (
    <section id="especialista" className="pb-20 lg:pb-24">
      <Container>
        <div className="overflow-hidden rounded-[32px] border border-black/5 bg-[#0B0B0F] px-6 py-10 sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#D946EF]">
              Atendimento
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Falar com um especialista
            </h2>
            <p className="mt-3 text-base text-white/65">
              Tire dúvidas sobre planos, migração de síndico para administradora ou onboarding de
              fornecedores. Atendimento humano, sem bots genéricos.
            </p>
          </div>
          <Link href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-8 inline-block lg:mt-0">
            <Button size="lg" className="gap-2 bg-white text-[#0B0B0F] hover:bg-white/90">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              Abrir WhatsApp
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
