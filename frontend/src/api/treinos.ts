import { api } from './client';
import type { DiaSemana, Exercicio, GrupoMuscular, Treino } from '../types/treino';

export function listarTreinos() {
  return api.get<Treino[]>('/treinos').then((r) => r.data);
}

export function criarTreino(dados: { diaSemana: DiaSemana; nomeTreino: string }) {
  return api.post<Treino>('/treinos', dados).then((r) => r.data);
}

export function atualizarTreino(
  treinoId: string,
  dados: Partial<{ diaSemana: DiaSemana; nomeTreino: string }>,
) {
  return api.put<Treino>(`/treinos/${treinoId}`, dados).then((r) => r.data);
}

export function excluirTreino(treinoId: string) {
  return api.delete(`/treinos/${treinoId}`);
}

export interface DadosExercicio {
  nome: string;
  grupoMuscular?: GrupoMuscular;
  seriesPlanejadas?: number;
  repeticoesPlanejadas?: number;
  pesoPlanejado?: number;
}

export function criarExercicio(treinoId: string, dados: DadosExercicio) {
  return api.post<Exercicio>(`/treinos/${treinoId}/exercicios`, dados).then((r) => r.data);
}

export function atualizarExercicio(
  treinoId: string,
  exercicioId: string,
  dados: Partial<DadosExercicio>,
) {
  return api
    .put<Exercicio>(`/treinos/${treinoId}/exercicios/${exercicioId}`, dados)
    .then((r) => r.data);
}

export function excluirExercicio(treinoId: string, exercicioId: string) {
  return api.delete(`/treinos/${treinoId}/exercicios/${exercicioId}`);
}
