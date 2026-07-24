import Link from "next/link";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Mascot } from "@/components/brand/Mascot";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function FornecedoresPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_80%_10%,rgba(192,38,211,0.12),transparent_35%),#ffffff]">
      <PublicHeader />
      <main className="pt-28 pb-20">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">
              Para Fornecedores
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-black lg:text-5xl">
              Receba oportunidades de condomínios com compliance e plano certo.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-black/60">
              Envie propostas com múltiplas condições, acompanhe o funil em Kanban e desbloqueie
              parcerias com administradoras no plano Intermediário ou Premium.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cadastro">
                <Button>Criar conta de fornecedor</Button>
              </Link>
              <Link href="/acesse">
                <Button variant="secondary">Já tenho conta</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <Mascot variant="avatar" className="h-64 w-64" priority />
          </div>
        </Container>
      </main>
    </div>
  );
}
