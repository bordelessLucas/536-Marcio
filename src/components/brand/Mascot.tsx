import Image from "next/image";
import { cn } from "@/lib/cn";

type MascotProps = {
  variant?: "full" | "avatar";
  className?: string;
  priority?: boolean;
};

export function Mascot({ variant = "full", className, priority = false }: MascotProps) {
  const src = variant === "avatar" ? "/brand/mascote-avatar-circular.png" : "/brand/mascote.png";
  const size = variant === "avatar" ? 160 : 420;

  return (
    <Image
      src={src}
      alt="Mascote CotaCondo"
      width={size}
      height={size}
      priority={priority}
      className={cn(
        variant === "avatar" ? "h-24 w-24 rounded-full object-cover" : "h-auto w-full max-w-md",
        className,
      )}
    />
  );
}
