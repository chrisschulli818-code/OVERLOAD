import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import {
  atualizarExercicio,
  atualizarTreino,
  criarExercicio,
  criarTreino,
  excluirExercicio,
  excluirTreino,
  listarTreinosDoUsuario,
  NaoEncontradoError,
} from '../services/treino.service';
import { DIAS_SEMANA, GRUPOS_MUSCULARES } from '../types/constants';

export const treinosRouter = Router();

treinosRouter.use(requireAuth);

function handleErro(err: unknown, res: import('express').Response) {
  if (err instanceof NaoEncontradoError) {
    return res.status(404).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Erro inesperado.' });
}

treinosRouter.get('/', async (req, res) => {
  const treinos = await listarTreinosDoUsuario(req.user!.id);
  res.json(treinos);
});

const criarTreinoSchema = z.object({
  diaSemana: z.enum(DIAS_SEMANA),
  nomeTreino: z.string().trim().min(1, 'Nome do treino é obrigatório.'),
});

treinosRouter.post('/', async (req, res) => {
  const parsed = criarTreinoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  const treino = await criarTreino({ usuarioId: req.user!.id, ...parsed.data });
  res.status(201).json(treino);
});

const atualizarTreinoSchema = z.object({
  diaSemana: z.enum(DIAS_SEMANA).optional(),
  nomeTreino: z.string().trim().min(1).optional(),
});

treinosRouter.put('/:treinoId', async (req, res) => {
  const parsed = atualizarTreinoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  try {
    const treino = await atualizarTreino({
      treinoId: req.params.treinoId,
      usuarioId: req.user!.id,
      ...parsed.data,
    });
    res.json(treino);
  } catch (err) {
    handleErro(err, res);
  }
});

treinosRouter.delete('/:treinoId', async (req, res) => {
  try {
    await excluirTreino(req.params.treinoId, req.user!.id);
    res.status(204).send();
  } catch (err) {
    handleErro(err, res);
  }
});

const criarExercicioSchema = z.object({
  nome: z.string().trim().min(1, 'Nome do exercício é obrigatório.'),
  grupoMuscular: z.enum(GRUPOS_MUSCULARES).optional(),
  seriesPlanejadas: z.number().int().min(0).optional(),
  repeticoesPlanejadas: z.number().int().min(0).optional(),
  pesoPlanejado: z.number().min(0).optional(),
});

treinosRouter.post('/:treinoId/exercicios', async (req, res) => {
  const parsed = criarExercicioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  try {
    const exercicio = await criarExercicio({
      treinoId: req.params.treinoId,
      usuarioId: req.user!.id,
      ...parsed.data,
    });
    res.status(201).json(exercicio);
  } catch (err) {
    handleErro(err, res);
  }
});

const atualizarExercicioSchema = z.object({
  nome: z.string().trim().min(1).optional(),
  grupoMuscular: z.enum(GRUPOS_MUSCULARES).nullable().optional(),
  seriesPlanejadas: z.number().int().min(0).nullable().optional(),
  repeticoesPlanejadas: z.number().int().min(0).nullable().optional(),
  pesoPlanejado: z.number().min(0).nullable().optional(),
  ordem: z.number().int().min(0).optional(),
});

treinosRouter.put('/:treinoId/exercicios/:exercicioId', async (req, res) => {
  const parsed = atualizarExercicioSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }
  try {
    const exercicio = await atualizarExercicio({
      exercicioId: req.params.exercicioId,
      usuarioId: req.user!.id,
      ...parsed.data,
    });
    res.json(exercicio);
  } catch (err) {
    handleErro(err, res);
  }
});

treinosRouter.delete('/:treinoId/exercicios/:exercicioId', async (req, res) => {
  try {
    await excluirExercicio(req.params.exercicioId, req.user!.id);
    res.status(204).send();
  } catch (err) {
    handleErro(err, res);
  }
});
