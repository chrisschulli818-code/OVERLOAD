export interface ChartPoint {
  label: string;
  value: number;
}

/** Gráfico de linha em SVG (sem dependências), responsivo via viewBox. */
export function EvolutionChart({ title, unit, points }: { title: string; unit: string; points: ChartPoint[] }) {
  if (points.length < 2) return null;
  const W = 400, H = 180, PX = 36, PT = 16, PB = 28;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min || 1) * 0.2;
  const lo = min - pad, hi = max + pad;
  const x = (i: number) => PX + (i * (W - PX - 12)) / (points.length - 1);
  const y = (v: number) => PT + ((hi - v) / (hi - lo)) * (H - PT - PB);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const ticks = [lo + pad, (min + max) / 2, hi - pad];

  return (
    <figure className="card">
      <figcaption className="mb-2 text-sm font-semibold">{title} <span className="font-normal text-muted">({unit})</span></figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${points.map((p) => `${p.label} ${p.value}${unit}`).join(', ')}`} className="w-full">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PX} x2={W - 12} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={PX - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{t.toFixed(1)}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2.5" />
            <text x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fontSize="10" fill="var(--muted)">{p.label}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
