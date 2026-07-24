import Link from "next/link";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(192,38,211,0.1),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(6,182,212,0.1),transparent_35%),#ffffff]">
      <PublicHeader />
      <Container className="flex min-h-screen items-center justify-center py-28">
        <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-gradient-to-br from-white/85 to-white/55 p-7 shadow-[0_20px_50px_-24px_rgba(147,51,234,0.35)] backdrop-blur-[28px]">
          <div className="mb-6 flex justify-center">
            <Logo href="/" className="h-10" />
          </div>
          <h1 className="text-center text-2xl font-bold tracking-tight text-black">{title}</h1>
          <p className="mt-2 text-center text-sm text-neutral-500">{subtitle}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-6 text-center text-xs text-neutral-400">
            <Link href="/" className="hover:text-neutral-700">
              Voltar ao início
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
