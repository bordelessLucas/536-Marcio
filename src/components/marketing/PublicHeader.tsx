"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/fornecedores", label: "Para Fornecedores" },
  { href: "/#cotacao", label: "Fazer cotação" },
  { href: process.env.NEXT_PUBLIC_BLOG_URL ?? "https://blog.cotacondo.com.br", label: "Blog", external: true },
  { href: "/acesse", label: "Acesse" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 right-0 top-6 z-50 flex justify-center px-4">
        <div className="flex h-16 w-full max-w-[1280px] items-center justify-between gap-6 rounded-2xl border border-white/70 bg-gradient-to-br from-white/80 to-white/50 px-5 shadow-[0_8px_30px_-12px_rgba(147,51,234,0.18)] backdrop-blur-[28px]">
          <Logo priority />

          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-black/60 transition-colors hover:text-black"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-black/60 transition-colors hover:text-black"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden md:block">
            <Link href="/cadastro">
              <Button size="sm">Começar agora</Button>
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[60] w-[280px] border-l border-black/10 bg-white/95 p-6 shadow-2xl backdrop-blur-[40px] transition-transform md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo href={null} />
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {LINKS.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="text-base font-medium">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="text-base font-medium" onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ),
          )}
          <Link href="/cadastro" onClick={() => setOpen(false)}>
            <Button className="w-full">Começar agora</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
