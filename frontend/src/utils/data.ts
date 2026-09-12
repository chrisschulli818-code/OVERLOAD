import { DIAS_SEMANA } from '../types/treino';
import type { DiaSemana } from '../types/treino';

export function diaSemanaDeHoje(): DiaSemana {
  const indiceJs = new Date().getDay(); // 0 = domingo, 1 = segunda, ...
  const indice = (indiceJs + 6) % 7; // 0 = segunda, ..., 6 = domingo
  return DIAS_SEMANA[indice];
}

export function dataDeHojeIso(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
