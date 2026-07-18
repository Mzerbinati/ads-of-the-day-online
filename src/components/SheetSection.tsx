interface SheetSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SheetSection({ title, children }: SheetSectionProps) {
  return (
    <section className="glass-panel p-6 md:p-7">
      <h2 className="label mb-4">{title}</h2>
      <div className="whitespace-pre-line text-[15px] leading-[1.65] text-secondary">
        {children}
      </div>
    </section>
  );
}
