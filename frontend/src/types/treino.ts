export const DIAS_SEMANA = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const;
export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const GRUPOS_MUSCULARES = [
  'PEITO',
  'COSTAS',
  'OMBROS',
  'BICEPS',
  'TRICEPS',
  'ABDOMEN',
  'GLUTEOS',
  'QUADRICEPS',
  'POSTERIOR_COXA',
  'PANTURRILHA',
  'ANTEBRACO',
] as const;
export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];

export const GRUPO_MUSCULAR_LABEL: Record<GrupoMuscular, string> = {
  PEITO: 'Peito',
  COSTAS: 'Costas',
  OMBROS: 'Ombros',
  BICEPS: 'Bíceps',
  TRICEPS: 'Tríceps',
  ABDOMEN: 'Abdômen',
  GLUTEOS: 'Glúteos',
  QUADRICEPS: 'Quadríceps',
  POSTERIOR_COXA: 'Posterior de coxa',
  PANTURRILHA: 'Panturrilha',
  ANTEBRACO: 'Antebraço',
};

export interface Exercicio {
  id: string;
  treinoId: string;
  nome: string;
  grupoMuscular: GrupoMuscular | null;
  seriesPlanejadas: number | null;
  repeticoesPlanejadas: number | null;
  pesoPlanejado: number | null;
  ordem: number;
}

export interface Treino {
  id: string;
  usuarioId: string;
  diaSemana: DiaSemana;
  nomeTreino: string;
  criadoEm: string;
  exercicios: Exercicio[];
}
