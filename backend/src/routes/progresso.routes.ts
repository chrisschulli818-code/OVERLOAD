import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listarExerciciosDoUsuario,
  listarProgressoDoExercicio,
  NaoEncontradoError,
} from '../services/progresso.service';

export const progressoRouter = Router();

progressoRouter.use(requireAuth);

progressoRouter.get('/exercicios', async (req, res) => {
  const exercicios = await listarExerciciosDoUsuario(req.user!.id);
  res.json(exercicios);
});

progressoRouter.get('/:exercicioId', async (req, res) => {
  const inicioStr = typeof req.query.inicio === 'string' ? req.query.inicio : undefined;
  const fimStr = typeof req.query.fim === 'string' ? req.query.fim : undefined;

  const inicio = inicioStr ? new Date(inicioStr) : undefined;
  const fim = fimStr ? new Date(fimStr) : undefined;
  if ((inicio && Number.isNaN(inicio.getTime())) || (fim && Number.isNaN(fim.getTime()))) {
    return res.status(400).json({ error: 'Data inválida.' });
  }

  try {
    const pontos = await listarProgressoDoExercicio(req.user!.id, req.params.exercicioId, inicio, fim);
    res.json(pontos);
  } catch (err) {
    if (err instanceof NaoEncontradoError) {
      return res.status(404).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro inesperado.' });
  }
});
