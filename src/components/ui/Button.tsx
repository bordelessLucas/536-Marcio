import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-12 px-6 text-base",
        variant === "primary" &&
          "bg-[linear-gradient(135deg,#E11D8A_0%,#9333EA_55%,#3B82F6_100%)] text-white shadow-[inset_0_4px_4px_rgba(255,255,255,0.28),0_10px_25px_-8px_rgba(147,51,234,0.35)] hover:brightness-105",
        variant === "secondary" &&
          "border border-black/10 bg-black/[0.04] text-neutral-900 hover:bg-black/[0.07]",
        variant === "ghost" && "text-[#9333EA] hover:bg-fuchsia-50",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}
