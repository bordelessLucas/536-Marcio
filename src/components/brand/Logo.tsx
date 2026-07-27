import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  href?: string | null;
  priority?: boolean;
};

export function Logo({ className, href = "/", priority = false }: LogoProps) {
  const image = (
    <Image
      src="/brand/logo.png"
      alt="CotaCondo"
      width={200}
      height={64}
      priority={priority}
      className={cn("w-auto", className || "h-12 md:h-14")}
    />
  );

  if (!href) return image;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="CotaCondo">
      {image}
    </Link>
  );
}
