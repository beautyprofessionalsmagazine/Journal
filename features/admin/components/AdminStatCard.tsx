type AdminStatCardProps = {
  label: string;
  value: string;
  detail?: string;
};

export function AdminStatCard({ label, value, detail }: AdminStatCardProps) {
  return (
    <article className="border-t border-black bg-white py-5">
      <p className="[font-family:var(--font-editorial-sans)] text-xs font-semibold uppercase text-black/58">
        {label}
      </p>
      <p className="mt-4 [overflow-wrap:anywhere] [font-family:var(--font-editorial-title)] text-[clamp(2.6rem,5vw,4.4rem)] font-bold leading-none text-black">
        {value}
      </p>
      {detail ? (
        <p className="mt-3 [font-family:var(--font-editorial-body-sans)] text-sm italic leading-6 text-black/62">
          {detail}
        </p>
      ) : null}
    </article>
  );
}
