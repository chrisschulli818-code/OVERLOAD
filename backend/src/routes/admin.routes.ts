import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { criarCodigo, listarCodigos } from '../services/codigo.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

const criarCodigoSchema = z.object({
  limiteUsos: z.number().int().min(1).max(1000).optional(),
  validoAteDias: z.number().int().min(1).max(3650).optional(),
});

adminRouter.post('/codigos', async (req, res) => {
  const parsed = criarCodigoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }

  const codigo = await criarCodigo({
    criadoPorId: req.user!.id,
    limiteUsos: parsed.data.limiteUsos,
    validoAteDias: parsed.data.validoAteDias,
  });

  return res.status(201).json(codigo);
});

adminRouter.get('/codigos', async (_req, res) => {
  const codigos = await listarCodigos();
  return res.json(codigos);
});

adminRouter.get('/usuarios', async (_req, res) => {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { criadoEm: 'desc' },
    select: {
      id: true,
      nome: true,
      email: true,
      sexo: true,
      role: true,
      criadoEm: true,
      codigoUsado: { select: { codigo: true } },
    },
  });
  return res.json(usuarios);
});
