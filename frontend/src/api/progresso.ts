import { api } from './client';
import type { ExercicioProgresso, PontoProgresso } from '../types/progresso';

export function listarExerciciosParaProgresso() {
  return api.get<ExercicioProgresso[]>('/progresso/exercicios').then((r) => r.data);
}

export function listarProgresso(exercicioId: string, inicio?: string) {
  return api
    .get<PontoProgresso[]>(`/progresso/${exercicioId}`, {
      params: inicio ? { inicio } : undefined,
    })
    .then((r) => r.data);
}
