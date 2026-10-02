import { ClassificacaoIMC } from '@/types';

const tone: Record<ClassificacaoIMC, string> = {
  [ClassificacaoIMC.AbaixoDoPeso]: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',
  [ClassificacaoIMC.PesoNormal]: 'bg-accent-soft text-accent',
  [ClassificacaoIMC.Sobrepeso]: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  [ClassificacaoIMC.ObesidadeGrau1]: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
  [ClassificacaoIMC.ObesidadeGrau2]: 'bg-red-500/15 text-red-600 dark:text-red-300',
  [ClassificacaoIMC.ObesidadeGrau3]: 'bg-red-600/20 text-red-700 dark:text-red-300',
};

export function ImcBadge({ value }: { value: ClassificacaoIMC | null }) {
  if (!value) return <span className="text-muted">—</span>;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[value]}`}>{value}</span>;
}
