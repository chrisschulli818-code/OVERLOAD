import { randomInt } from 'node:crypto';
import { prisma } from '../lib/prisma';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem caracteres ambíguos (0,O,1,I)

function gerarStringAleatoria(tamanho = 8): string {
  let resultado = '';
  for (let i = 0; i < tamanho; i++) {
    resultado += ALFABETO[randomInt(ALFABETO.length)];
  }
  return resultado;
}

export class CodigoInvalidoError extends Error {}

export async function criarCodigo(params: {
  criadoPorId: string;
  limiteUsos?: number;
  validoAteDias?: number;
}) {
  const { criadoPorId, limiteUsos = 1, validoAteDias } = params;

  const expiraEm = validoAteDias
    ? new Date(Date.now() + validoAteDias * 24 * 60 * 60 * 1000)
    : null;

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarStringAleatoria();
    try {
      return await prisma.codigoAcesso.create({
        data: {
          codigo,
          criadoPorId,
          limiteUsos,
          expiraEm,
        },
      });
    } catch (err: unknown) {
      const isUniqueViolation =
        err && typeof err === 'object' && 'code' in err && err.code === 'P2002';
      if (!isUniqueViolation) throw err;
    }
  }

  throw new Error('Não foi possível gerar um código único. Tente novamente.');
}

export async function listarCodigos() {
  return prisma.codigoAcesso.findMany({
    orderBy: { criadoEm: 'desc' },
    include: {
      criadoPor: { select: { id: true, nome: true, email: true } },
      usadoPor: { select: { id: true, nome: true, email: true, criadoEm: true } },
    },
  });
}

export async function validarEConsumirCodigo(codigoTexto: string) {
  return prisma.$transaction(async (tx) => {
    const codigo = await tx.codigoAcesso.findUnique({ where: { codigo: codigoTexto } });

    if (!codigo) {
      throw new CodigoInvalidoError('Código de acesso inválido.');
    }
    if (codigo.expiraEm && codigo.expiraEm.getTime() < Date.now()) {
      throw new CodigoInvalidoError('Código de acesso expirado.');
    }
    if (codigo.usosCount >= codigo.limiteUsos) {
      throw new CodigoInvalidoError('Código de acesso já atingiu o limite de usos.');
    }

    await tx.codigoAcesso.update({
      where: { id: codigo.id },
      data: { usosCount: { increment: 1 } },
    });

    return codigo;
  });
}
