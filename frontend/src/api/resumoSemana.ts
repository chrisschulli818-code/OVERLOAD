import { api } from './client';
import type { ResumoSemana } from '../types/resumoSemana';

export function obterResumoSemana() {
  return api.get<ResumoSemana>('/resumo-semana').then((r) => r.data);
}
