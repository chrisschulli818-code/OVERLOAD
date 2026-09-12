export interface ExercicioProgresso {
  id: string;
  nome: string;
  treino: { nomeTreino: string; diaSemana: string };
}

export interface PontoProgresso {
  data: string;
  pesoMaximo: number;
  repeticoesTotais: number;
  volumeTotal: number;
}
