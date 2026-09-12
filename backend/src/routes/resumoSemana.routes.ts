import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { obterResumoSemana } from '../services/resumoSemana.service';

export const resumoSemanaRouter = Router();

resumoSemanaRouter.use(requireAuth);

resumoSemanaRouter.get('/', async (req, res) => {
  const resumo = await obterResumoSemana(req.user!.id);
  res.json(resumo);
});
