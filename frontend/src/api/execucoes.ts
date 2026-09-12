import { api } from './client';
import type { RegistroExecucao } from '../types/execucao';

export function listarExecucoesDoDia(data: string) {
  return api.get<RegistroExecucao[]>('/execucoes', { params: { data } }).then((r) => r.data);
}

export function registrarSerie(dados: {
  exercicioId: string;
  serieNumero: number;
  repeticoesFeitas: number;
  pesoUsado: number;
  data?: string;
}) {
  return api.post<RegistroExecucao>('/execucoes', dados).then((r) => r.data);
}

export function excluirExecucao(id: string) {
  return api.delete(`/execucoes/${id}`);
}
