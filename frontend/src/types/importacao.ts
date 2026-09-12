import type { DiaSemana, GrupoMuscular } from './treino';

export interface ExercicioExtraido {
  nome: string;
  series: number | null;
  repeticoes: number | null;
  peso: number | null;
  grupo_muscular?: GrupoMuscular | null;
}

export interface DiaExtraido {
  dia_semana: DiaSemana;
  nome_treino: string;
  exercicios: ExercicioExtraido[];
}

export interface FichaExtraida {
  dias: DiaExtraido[];
}
