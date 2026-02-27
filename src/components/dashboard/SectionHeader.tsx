interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {icon && (
        <div className="bg-emerald-50/80 text-emerald-500 p-2.5 rounded-xl backdrop-blur-sm border border-emerald-100/60">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-section-title text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
