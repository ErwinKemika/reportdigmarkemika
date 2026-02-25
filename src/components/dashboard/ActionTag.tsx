const tagColors: Record<string, string> = {
  Ads: "bg-primary/10 text-primary border-primary/20",
  SEO: "bg-success/10 text-success border-success/20",
  UX: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
  Campaign: "bg-warning/10 text-warning border-warning/20",
};

export function ActionTag({ tag }: { tag: string }) {
  const color = tagColors[tag] || "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {tag}
    </span>
  );
}
