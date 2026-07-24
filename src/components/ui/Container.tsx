import { cn } from "@/lib/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-6 sm:px-12 lg:px-20", className)}>
      {children}
    </div>
  );
}
