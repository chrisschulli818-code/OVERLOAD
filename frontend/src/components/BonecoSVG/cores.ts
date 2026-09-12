const NEUTRO: [number, number, number] = [51, 65, 85]; // slate-700
const DESTAQUE: [number, number, number] = [52, 211, 153]; // emerald-400

function misturar(a: [number, number, number], b: [number, number, number], t: number) {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Retorna a cor de uma região do boneco dada sua intensidade normalizada (0 a 1). */
export function corPorIntensidade(intensidade: number): string {
  if (intensidade <= 0) return misturar(NEUTRO, NEUTRO, 0);
  const t = 0.25 + intensidade * 0.75; // piso visível mesmo com pouco volume
  return misturar(NEUTRO, DESTAQUE, t);
}
