import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import {
  excluirExecucao,
  listarExecucoesDoDia,
  NaoEncontradoError,
  registrarSerie,
} from '../services/execucao.service';

export const execucoesRouter = Router();

execucoesRouter.use(requireAuth);

execucoesRouter.get('/', async (req, res) => {
  const dataStr = typeof req.query.data === 'string' ? req.query.data : undefined;
  const data = dataStr ? new Date(dataStr) : new Date();
  if (Number.isNaN(data.getTime())) {
    return res.status(400).json({ error: 'Data inválida.' });
  }
  const registros = await listarExecucoesDoDia(req.user!.id, data);
  res.json(registros);
});

const registrarSchema = z.object({
  exercicioId: z.string().min(1),
  serieNumero: z.number().int().min(1),
  repeticoesFeitas: z.number().int().min(0),
  pesoUsado: z.number().min(0),
  data: z.string().optional(),
});

execucoesRouter.post('/', async (req, res) => {
  const parsed = registrarSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }

  const data = parsed.data.data ? new Date(parsed.data.data) : undefined;
  if (data && Number.isNaN(data.getTime())) {
    return res.status(400).json({ error: 'Data inválida.' });
  }

  try {
    const registro = await registrarSerie({
      usuarioId: req.user!.id,
      exercicioId: parsed.data.exercicioId,
      serieNumero: parsed.data.serieNumero,
      repeticoesFeitas: parsed.data.repeticoesFeitas,
      pesoUsado: parsed.data.pesoUsado,
      data,
    });
    res.status(201).json(registro);
  } catch (err) {
    if (err instanceof NaoEncontradoError) {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro inesperado.' });
  }
});

execucoesRouter.delete('/:id', async (req, res) => {
  try {
    await excluirExecucao(req.params.id, req.user!.id);
    res.status(204).send();
  } catch (err) {
    if (err instanceof NaoEncontradoError) {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro inesperado.' });
  }
});
