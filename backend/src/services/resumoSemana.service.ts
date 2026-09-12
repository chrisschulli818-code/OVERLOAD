import { prisma } from '../lib/prisma';
import type { GrupoMuscular } from '../types/constants';

function inicioDaSemana(data: Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  const diasDesdeSegunda = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - diasDesdeSegunda);
  return d;
}

export async function obterResumoSemana(usuarioId: string, referencia?: Date) {
  const inicio = inicioDaSemana(referencia ?? new Date());
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);

  const registros = await prisma.registroExecucao.findMany({
    where: {
      data: { gte: inicio, lt: fim },
      exercicio: { treino: { usuarioId } },
    },
    include: { exercicio: { select: { grupoMuscular: true } } },
  });

  const volumePorGrupo: Partial<Record<GrupoMuscular, number>> = {};
  for (const registro of registros) {
    const grupo = registro.exercicio.grupoMuscular as GrupoMuscular | null;
    if (!grupo) continue;
    volumePorGrupo[grupo] = (volumePorGrupo[grupo] ?? 0) + 1;
  }

  return {
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    volumePorGrupo,
  };
}
