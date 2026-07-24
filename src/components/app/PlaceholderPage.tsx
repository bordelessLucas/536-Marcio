type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-white/70 p-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#9333EA]">Em breve</p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{description}</p>
    </div>
  );
}
