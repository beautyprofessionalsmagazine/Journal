type TagBadgeProps = {
  label: string;
};

export function TagBadge({ label }: TagBadgeProps) {
  return (
    <span className="inline-flex border border-black/15 px-2 py-1 text-xs font-medium uppercase text-black">
      {label}
    </span>
  );
}
