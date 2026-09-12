import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { extrairTextoDoPdf } from '../services/pdfExtractor.service';
import { ExtracaoFalhouError, extrairFichaDeTreino } from '../services/claudeParser.service';
import { salvarFichaDeTreino } from '../services/treino.service';
import { DIAS_SEMANA, GRUPOS_MUSCULARES } from '../types/constants';

export const pdfRouter = Router();

pdfRouter.use(requireAuth);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Apenas arquivos PDF são aceitos.'));
      return;
    }
    cb(null, true);
  },
});

pdfRouter.post('/extrair', upload.single('arquivo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo PDF enviado.' });
  }

  try {
    const texto = await extrairTextoDoPdf(req.file.buffer);
    if (!texto.trim()) {
      return res
        .status(400)
        .json({ error: 'Não foi possível extrair texto do PDF (pode ser uma imagem escaneada).' });
    }

    const ficha = await extrairFichaDeTreino(texto);
    return res.json(ficha);
  } catch (err) {
    if (err instanceof ExtracaoFalhouError) {
      return res.status(422).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar o PDF.' });
  }
});

const salvarSchema = z.object({
  dias: z
    .array(
      z.object({
        dia_semana: z.enum(DIAS_SEMANA),
        nome_treino: z.string().trim().min(1),
        exercicios: z.array(
          z.object({
            nome: z.string().trim().min(1),
            grupo_muscular: z.enum(GRUPOS_MUSCULARES).nullable().optional(),
            series: z.number().int().min(0).nullable().optional(),
            repeticoes: z.number().int().min(0).nullable().optional(),
            peso: z.number().min(0).nullable().optional(),
          }),
        ),
      }),
    )
    .min(1, 'Envie ao menos um dia de treino.'),
});

pdfRouter.post('/salvar', async (req, res) => {
  const parsed = salvarSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
  }

  const treinos = await salvarFichaDeTreino(
    req.user!.id,
    parsed.data.dias.map((dia) => ({
      diaSemana: dia.dia_semana,
      nomeTreino: dia.nome_treino,
      exercicios: dia.exercicios.map((ex) => ({
        nome: ex.nome,
        grupoMuscular: ex.grupo_muscular,
        seriesPlanejadas: ex.series,
        repeticoesPlanejadas: ex.repeticoes,
        pesoPlanejado: ex.peso,
      })),
    })),
  );

  res.status(201).json(treinos);
});
