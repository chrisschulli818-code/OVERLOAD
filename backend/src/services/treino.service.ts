import { prisma } from '../lib/prisma';
import type { DiaSemana, GrupoMuscular } from '../types/constants';

export class NaoEncontradoError extends Error {}

export async function listarTreinosDoUsuario(usuarioId: string) {
  return prisma.treino.findMany({
    where: { usuarioId },
    orderBy: { criadoEm: 'asc' },
    include: {
      exercicios: { orderBy: { ordem: 'asc' } },
    },
  });
}

async function garantirTreinoDoUsuario(treinoId: string, usuarioId: string) {
  const treino = await prisma.treino.findUnique({ where: { id: treinoId } });
  if (!treino || treino.usuarioId !== usuarioId) {
    throw new NaoEncontradoError('Treino não encontrado.');
  }
  return treino;
}

export async function criarTreino(params: {
  usuarioId: string;
  diaSemana: DiaSemana;
  nomeTreino: string;
}) {
  return prisma.treino.create({
    data: {
      usuarioId: params.usuarioId,
      diaSemana: params.diaSemana,
      nomeTreino: params.nomeTreino,
    },
    include: { exercicios: true },
  });
}

export async function atualizarTreino(params: {
  treinoId: string;
  usuarioId: string;
  diaSemana?: DiaSemana;
  nomeTreino?: string;
}) {
  await garantirTreinoDoUsuario(params.treinoId, params.usuarioId);
  return prisma.treino.update({
    where: { id: params.treinoId },
    data: {
      diaSemana: params.diaSemana,
      nomeTreino: params.nomeTreino,
    },
    include: { exercicios: { orderBy: { ordem: 'asc' } } },
  });
}

export async function excluirTreino(treinoId: string, usuarioId: string) {
  await garantirTreinoDoUsuario(treinoId, usuarioId);
  await prisma.treino.delete({ where: { id: treinoId } });
}

export async function criarExercicio(params: {
  treinoId: string;
  usuarioId: string;
  nome: string;
  grupoMuscular?: GrupoMuscular;
  seriesPlanejadas?: number;
  repeticoesPlanejadas?: number;
  pesoPlanejado?: number;
}) {
  await garantirTreinoDoUsuario(params.treinoId, params.usuarioId);

  const ultimo = await prisma.exercicio.findFirst({
    where: { treinoId: params.treinoId },
    orderBy: { ordem: 'desc' },
  });

  return prisma.exercicio.create({
    data: {
      treinoId: params.treinoId,
      nome: params.nome,
      grupoMuscular: params.grupoMuscular,
      seriesPlanejadas: params.seriesPlanejadas,
      repeticoesPlanejadas: params.repeticoesPlanejadas,
      pesoPlanejado: params.pesoPlanejado,
      ordem: (ultimo?.ordem ?? -1) + 1,
    },
  });
}

async function garantirExercicioDoUsuario(exercicioId: string, usuarioId: string) {
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId },
    include: { treino: true },
  });
  if (!exercicio || exercicio.treino.usuarioId !== usuarioId) {
    throw new NaoEncontradoError('Exercício não encontrado.');
  }
  return exercicio;
}

export async function atualizarExercicio(params: {
  exercicioId: string;
  usuarioId: string;
  nome?: string;
  grupoMuscular?: GrupoMuscular | null;
  seriesPlanejadas?: number | null;
  repeticoesPlanejadas?: number | null;
  pesoPlanejado?: number | null;
  ordem?: number;
}) {
  await garantirExercicioDoUsuario(params.exercicioId, params.usuarioId);
  return prisma.exercicio.update({
    where: { id: params.exercicioId },
    data: {
      nome: params.nome,
      grupoMuscular: params.grupoMuscular,
      seriesPlanejadas: params.seriesPlanejadas,
      repeticoesPlanejadas: params.repeticoesPlanejadas,
      pesoPlanejado: params.pesoPlanejado,
      ordem: params.ordem,
    },
  });
}

export async function excluirExercicio(exercicioId: string, usuarioId: string) {
  await garantirExercicioDoUsuario(exercicioId, usuarioId);
  await prisma.exercicio.delete({ where: { id: exercicioId } });
}
