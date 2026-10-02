import {
  ClassificacaoIMC,
  LIMITES_IMC,
  Sexo,
  type DobrasCutaneas,
  type PollockInput,
  type ResultadoAvaliacao,
} from '@/types';

const round = (value: number, decimals = 2): number => {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
};

const isPositive = (n: number | null | undefined): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n > 0;

/** IMC = peso (kg) / altura² (m). Retorna null se os dados forem inválidos. */
export function calcularIMC(alturaM: number | null, pesoKg: number | null): number | null {
  if (!isPositive(alturaM) || !isPositive(pesoKg)) return null;
  return round(pesoKg / (alturaM * alturaM));
}

export function classificarIMC(imc: number | null): ClassificacaoIMC | null {
  if (imc === null || !Number.isFinite(imc) || imc <= 0) return null;
  let resultado: ClassificacaoIMC = ClassificacaoIMC.AbaixoDoPeso;
  for (const [limite, classificacao] of LIMITES_IMC) {
    if (imc >= limite) resultado = classificacao;
  }
  return resultado;
}

/** Soma das 7 dobras; null se alguma estiver ausente/inválida. */
export function somarDobras(d: DobrasCutaneas): number | null {
  const valores = [d.triceps, d.peito, d.axilarMedia, d.subescapular, d.abdominal, d.supraIliaca, d.coxa];
  if (!valores.every(isPositive)) return null;
  return valores.reduce((acc, v) => acc + v, 0);
}

/**
 * % de gordura — Pollock 7 dobras (densidade) + equação de Siri.
 * Homens:   DC = 1,112 − 0,00043499·Σ + 0,00000055·Σ² − 0,00028826·idade
 * Mulheres: DC = 1,097 − 0,00046971·Σ + 0,00000056·Σ² − 0,00012828·idade
 * %G = 495 / DC − 450
 */
export function calcularPercentualGorduraPollock7({ sexo, idade, dobras }: PollockInput): number | null {
  const soma = somarDobras(dobras);
  if (soma === null || !isPositive(idade)) return null;

  const densidade =
    sexo === Sexo.Masculino
      ? 1.112 - 0.00043499 * soma + 0.00000055 * soma ** 2 - 0.00028826 * idade
      : 1.097 - 0.00046971 * soma + 0.00000056 * soma ** 2 - 0.00012828 * idade;

  const percentual = 495 / densidade - 450;
  if (!Number.isFinite(percentual) || percentual < 0) return null;
  return round(percentual);
}

/** Calcula IMC, classificação, % gordura e massas magra/gorda de uma só vez. */
export function calcularAvaliacao(input: {
  altura: number | null;
  peso: number | null;
  sexo: Sexo;
  idade: number;
  dobras: DobrasCutaneas;
}): ResultadoAvaliacao {
  const imc = calcularIMC(input.altura, input.peso);
  const percentualGordura = calcularPercentualGorduraPollock7({
    sexo: input.sexo,
    idade: input.idade,
    dobras: input.dobras,
  });
  const massaGorda =
    percentualGordura !== null && isPositive(input.peso)
      ? round((input.peso * percentualGordura) / 100)
      : null;
  const massaMagra = massaGorda !== null && isPositive(input.peso) ? round(input.peso - massaGorda) : null;

  return { imc, classificacaoImc: classificarIMC(imc), percentualGordura, massaGorda, massaMagra };
}
