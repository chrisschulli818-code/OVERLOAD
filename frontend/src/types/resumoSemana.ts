import type { GrupoMuscular } from './treino';

export interface ResumoSemana {
  inicio: string;
  fim: string;
  volumePorGrupo: Partial<Record<GrupoMuscular, number>>;
}
