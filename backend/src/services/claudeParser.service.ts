import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod/v4';
import { env } from '../config/env';
import { DIAS_SEMANA } from '../types/constants';

const ExercicioExtraidoSchema = z.object({
  nome: z.string(),
  series: z.number().int().nullable(),
  repeticoes: z.number().int().nullable(),
  peso: z.number().nullable(),
});

const DiaExtraidoSchema = z.object({
  dia_semana: z.enum(DIAS_SEMANA),
  nome_treino: z.string(),
  exercicios: z.array(ExercicioExtraidoSchema),
});

const FichaExtraidaSchema = z.object({
  dias: z.array(DiaExtraidoSchema),
});

export type FichaExtraida = z.infer<typeof FichaExtraidaSchema>;

export class ExtracaoFalhouError extends Error {}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!env.anthropicApiKey) {
      throw new ExtracaoFalhouError(
        'ANTHROPIC_API_KEY não configurada no backend. Configure a chave para usar a importação por PDF.',
      );
    }
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

const PROMPT_SISTEMA = `Você extrai fichas de treino de academia a partir de texto bruto extraído de um PDF.
O texto pode estar desorganizado (quebras de linha erradas, tabelas mal formatadas). Sua tarefa:
- Identificar cada dia de treino (ex: "Treino A", "Segunda-feira", "Dia 1 - Peito").
- Mapear cada dia para um dos valores exatos: ${DIAS_SEMANA.join(', ')}. Se o texto não indicar
  claramente o dia da semana (ex: apenas "Treino A"), infira uma ordem sequencial começando em
  Segunda-feira para o primeiro treino encontrado, Terça para o segundo, e assim por diante.
- Para cada exercício, extrair nome, número de séries, repetições e peso planejado (em kg).
  Use null quando o valor não estiver disponível no texto — nunca invente números.
- Preservar o nome do treino como aparece no texto (ex: "Treino A - Peito e Tríceps").`;

export async function extrairFichaDeTreino(textoBruto: string): Promise<FichaExtraida> {
  const anthropic = getClient();

  const response = await anthropic.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system: PROMPT_SISTEMA,
    messages: [
      {
        role: 'user',
        content: `Texto extraído do PDF da ficha de treino:\n\n"""\n${textoBruto}\n"""`,
      },
    ],
    output_config: {
      format: zodOutputFormat(FichaExtraidaSchema),
    },
  });

  if (!response.parsed_output) {
    throw new ExtracaoFalhouError('Não foi possível interpretar o PDF como uma ficha de treino.');
  }

  return response.parsed_output;
}
