import { z } from 'zod';
import { Sexo } from '@/types';

const emptyToNull = (v: unknown) => (v === '' || v === undefined || v === null ? null : v);

const optNum = z.preprocess(
  (v) => {
    const x = emptyToNull(v);
    return x === null ? null : Number(String(x).replace(',', '.'));
  },
  z.number().positive('Valor inválido').nullable(),
);
const optText = z.preprocess(
  (v) => {
    const x = emptyToNull(v);
    return typeof x === 'string' ? x.trim() || null : x;
  },
  z.string().max(2000).nullable(),
);
const optUrl = z.preprocess(emptyToNull, z.url('URL inválida').nullable());
const bool = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());

export const studentSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome').max(150),
  idade: z.coerce.number().int().min(10, 'Idade inválida').max(110, 'Idade inválida'),
  sexo: z.enum([Sexo.Masculino, Sexo.Feminino]),
  contato: z.string().trim().min(8, 'Informe o contato').max(30),
  email: z.email('E-mail inválido').max(255),
  jaTreinouAntes: bool,
  tempoDeTreino: optText,
  tempoSemAtividadeFisica: optText,
  objetivo: optText,
  frequenciaSemanal: z.preprocess(
    (v) => {
      const x = emptyToNull(v);
      return x === null ? null : Number(x);
    },
    z.number().int().min(0).max(7).nullable(),
  ),
  tempoTreinoPorDia: optText,
  temDoencaOuProblemaSaude: bool,
  doencaOuProblemaSaudeDetalhe: optText,
  temLimitacaoMovimento: bool,
  limitacaoMovimentoDetalhe: optText,
  temDorEmMovimento: bool,
  dorEmMovimentoDetalhe: optText,
  fezCirurgias: bool,
  cirurgiasDetalhe: optText,
  usaMedicamentoControlado: bool,
  medicamentoControladoDetalhe: optText,
  estaFazendoDieta: bool,
  consomeAlcool: bool,
  fuma: bool,
});
export type StudentInput = z.infer<typeof studentSchema>;

export const assessmentSchema = z.object({
  data: z.coerce.date({ error: 'Informe a data da avaliação' }),
  altura: optNum.refine((v) => v === null || v < 3, 'Informe a altura em metros (ex.: 1,75)'),
  peso: optNum,
  circOmbro: optNum, circTorax: optNum, circCintura: optNum, circAbdominal: optNum, circQuadril: optNum,
  circBracoNormalEsq: optNum, circBracoNormalDir: optNum,
  circBracoContraidoEsq: optNum, circBracoContraidoDir: optNum,
  circAntebracoEsq: optNum, circAntebracoDir: optNum,
  circCoxaEsq: optNum, circCoxaDir: optNum,
  circPanturrilhaEsq: optNum, circPanturrilhaDir: optNum,
  dobraTriceps: optNum, dobraPeito: optNum, dobraAxilarMedia: optNum, dobraSubescapular: optNum,
  dobraAbdominal: optNum, dobraSupraIliaca: optNum, dobraCoxa: optNum,
  fotoAnterior: optUrl, fotoPosterior: optUrl, fotoLadoEsquerdo: optUrl, fotoLadoDireito: optUrl,
  observacoes: optText,
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;

/** Converte FormData em objeto simples (última ocorrência vence). */
export const formToObject = (fd: FormData): Record<string, FormDataEntryValue> =>
  Object.fromEntries(fd.entries());

export type FieldErrors = Record<string, string>;
export const fieldErrors = (e: z.ZodError): FieldErrors => {
  const out: FieldErrors = {};
  for (const i of e.issues) out[String(i.path[0] ?? '_')] ??= i.message;
  return out;
};
