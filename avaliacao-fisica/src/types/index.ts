/** Classificações de IMC (OMS). Valores são os rótulos exibidos na UI. */
export const ClassificacaoIMC = {
  AbaixoDoPeso: 'Abaixo do peso',
  PesoNormal: 'Peso normal',
  Sobrepeso: 'Sobrepeso',
  ObesidadeGrau1: 'Obesidade Grau I',
  ObesidadeGrau2: 'Obesidade Grau II',
  ObesidadeGrau3: 'Obesidade Grau III',
} as const;
export type ClassificacaoIMC = (typeof ClassificacaoIMC)[keyof typeof ClassificacaoIMC];

export const Sexo = {
  Masculino: 'masculino',
  Feminino: 'feminino',
} as const;
export type Sexo = (typeof Sexo)[keyof typeof Sexo];

/** Limites inferiores (inclusivos) de IMC por classificação, em ordem crescente. */
export const LIMITES_IMC: ReadonlyArray<readonly [number, ClassificacaoIMC]> = [
  [0, ClassificacaoIMC.AbaixoDoPeso],
  [18.5, ClassificacaoIMC.PesoNormal],
  [25, ClassificacaoIMC.Sobrepeso],
  [30, ClassificacaoIMC.ObesidadeGrau1],
  [35, ClassificacaoIMC.ObesidadeGrau2],
  [40, ClassificacaoIMC.ObesidadeGrau3],
];

/** Anamnese do aluno. Perguntas sim/não têm um campo de detalhe opcional. */
export interface Anamnese {
  jaTreinouAntes: boolean;
  tempoDeTreino: string | null; // "Treina há quanto tempo?"
  tempoSemAtividadeFisica: string | null;
  objetivo: string | null;
  frequenciaSemanal: number | null; // dias por semana
  tempoTreinoPorDia: string | null;
  temDoencaOuProblemaSaude: boolean;
  doencaOuProblemaSaudeDetalhe: string | null;
  temLimitacaoMovimento: boolean;
  limitacaoMovimentoDetalhe: string | null;
  temDorEmMovimento: boolean;
  dorEmMovimentoDetalhe: string | null;
  fezCirurgias: boolean;
  cirurgiasDetalhe: string | null;
  usaMedicamentoControlado: boolean;
  medicamentoControladoDetalhe: string | null;
  estaFazendoDieta: boolean;
  consomeAlcool: boolean;
  fuma: boolean;
}

export interface Student extends Anamnese {
  id: string;
  nome: string;
  idade: number;
  sexo: Sexo; // necessário para o protocolo de Pollock
  contato: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
export type NewStudent = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;

/** Par esquerdo/direito. */
export interface Bilateral {
  esquerdo: number | null;
  direito: number | null;
}

export interface Circunferencias {
  ombro: number | null;
  torax: number | null;
  cintura: number | null;
  abdominal: number | null;
  quadril: number | null;
  bracoNormal: Bilateral;
  bracoContraido: Bilateral;
  antebraco: Bilateral;
  coxa: Bilateral;
  panturrilha: Bilateral;
}

/** Dobras cutâneas em mm. */
export interface DobrasCutaneas {
  triceps: number | null;
  peito: number | null;
  axilarMedia: number | null;
  subescapular: number | null;
  abdominal: number | null;
  supraIliaca: number | null;
  coxa: number | null;
}

export interface ComposicaoCorporal {
  massaMagra: number | null; // kg
  massaGorda: number | null; // kg
  percentualGordura: number | null; // %
}

export interface FotosAvaliacao {
  anterior: string | null;
  posterior: string | null;
  ladoEsquerdo: string | null;
  ladoDireito: string | null;
}

export interface Assessment {
  id: string;
  studentId: string;
  data: Date; // obrigatório
  altura: number | null; // m
  peso: number | null; // kg
  imc: number | null;
  classificacaoImc: ClassificacaoIMC | null;
  circunferencias: Circunferencias;
  dobras: DobrasCutaneas;
  composicao: ComposicaoCorporal;
  fotos: FotosAvaliacao;
  observacoes: string | null;
  createdAt: Date;
}
export type NewAssessment = Omit<Assessment, 'id' | 'createdAt'>;

export interface PollockInput {
  sexo: Sexo;
  idade: number;
  dobras: DobrasCutaneas;
}

export interface ResultadoAvaliacao {
  imc: number | null;
  classificacaoImc: ClassificacaoIMC | null;
  percentualGordura: number | null;
  massaGorda: number | null;
  massaMagra: number | null;
}
