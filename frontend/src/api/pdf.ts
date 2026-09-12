import { api } from './client';
import type { FichaExtraida } from '../types/importacao';
import type { Treino } from '../types/treino';

export async function extrairFichaDePdf(arquivo: File): Promise<FichaExtraida> {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  const res = await api.post<FichaExtraida>('/pdf/extrair', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function salvarFicha(ficha: FichaExtraida): Promise<Treino[]> {
  const res = await api.post<Treino[]>('/pdf/salvar', ficha);
  return res.data;
}
