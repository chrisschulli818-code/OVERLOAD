import { prisma } from '../lib/prisma';

export class NaoEncontradoError extends Error {}

function inicioDoDia(data: Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
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

export async function registrarSerie(params: {
  usuarioId: string;
  exercicioId: string;
  serieNumero: number;
  repeticoesFeitas: number;
  pesoUsado: number;
  data?: Date;
}) {
  await garantirExercicioDoUsuario(params.exercicioId, params.usuarioId);
  const dia = inicioDoDia(params.data ?? new Date());

  const existente = await prisma.registroExecucao.findFirst({
    where: { exercicioId: params.exercicioId, serieNumero: params.serieNumero, data: dia },
  });

  if (existente) {
    return prisma.registroExecucao.update({
      where: { id: existente.id },
      data: {
        repeticoesFeitas: params.repeticoesFeitas,
        pesoUsado: params.pesoUsado,
      },
    });
  }

  return prisma.registroExecucao.create({
    data: {
      exercicioId: params.exercicioId,
      serieNumero: params.serieNumero,
      repeticoesFeitas: params.repeticoesFeitas,
      pesoUsado: params.pesoUsado,
      data: dia,
    },
  });
}

export async function listarExecucoesDoDia(usuarioId: string, data: Date) {
  const dia = inicioDoDia(data);
  return prisma.registroExecucao.findMany({
    where: { data: dia, exercicio: { treino: { usuarioId } } },
    orderBy: { serieNumero: 'asc' },
  });
}

export async function excluirExecucao(id: string, usuarioId: string) {
  const registro = await prisma.registroExecucao.findUnique({
    where: { id },
    include: { exercicio: { include: { treino: true } } },
  });
  if (!registro || registro.exercicio.treino.usuarioId !== usuarioId) {
    throw new NaoEncontradoError('Registro não encontrado.');
  }
  await prisma.registroExecucao.delete({ where: { id } });
}
