import { prisma } from '../lib/prisma';

export class NaoEncontradoError extends Error {}

export async function listarExerciciosDoUsuario(usuarioId: string) {
  return prisma.exercicio.findMany({
    where: { treino: { usuarioId } },
    select: {
      id: true,
      nome: true,
      treino: { select: { nomeTreino: true, diaSemana: true } },
    },
    orderBy: { nome: 'asc' },
  });
}

export interface PontoProgresso {
  data: string;
  pesoMaximo: number;
  repeticoesTotais: number;
  volumeTotal: number;
}

export async function listarProgressoDoExercicio(
  usuarioId: string,
  exercicioId: string,
  inicio?: Date,
  fim?: Date,
): Promise<PontoProgresso[]> {
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId },
    include: { treino: true },
  });
  if (!exercicio || exercicio.treino.usuarioId !== usuarioId) {
    throw new NaoEncontradoError('Exercício não encontrado.');
  }

  const registros = await prisma.registroExecucao.findMany({
    where: {
      exercicioId,
      ...(inicio || fim
        ? {
            data: {
              ...(inicio ? { gte: inicio } : {}),
              ...(fim ? { lte: fim } : {}),
            },
          }
        : {}),
    },
    orderBy: { data: 'asc' },
  });

  const porDia = new Map<string, PontoProgresso>();
  for (const registro of registros) {
    const chave = registro.data.toISOString().slice(0, 10);
    const atual = porDia.get(chave) ?? {
      data: chave,
      pesoMaximo: 0,
      repeticoesTotais: 0,
      volumeTotal: 0,
    };
    atual.pesoMaximo = Math.max(atual.pesoMaximo, registro.pesoUsado);
    atual.repeticoesTotais += registro.repeticoesFeitas;
    atual.volumeTotal += registro.repeticoesFeitas * registro.pesoUsado;
    porDia.set(chave, atual);
  }

  return Array.from(porDia.values());
}
